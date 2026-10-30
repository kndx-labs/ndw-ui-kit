#!/usr/bin/env tsx

import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {getCodegenComment, roundDownTo3Decimals} from './utils/fmt';
import {FigmaColorValue} from './figma/types';
import {HANDSET_BREAKPOINT, SCRIPTS_DATA_DIR, SRC_DIR} from './conf';

const SCSS_CODEGEN_COMMENT = getCodegenComment(__filename);

const INPUT_FILE = join(
  SCRIPTS_DATA_DIR,
  'figma-vars',
  'design-variables-full.json',
);

const OUTPUT_DIR = join(SRC_DIR, 'lib', 'styles');
const NDWU_CSS_VAR_PREFIX = '--ndwu-';

// Figma variables JSON types
interface FigmaMode {
  name: string;
  modeId: string;
}

interface FigmaVariableAlias {
  type: 'VARIABLE_ALIAS';
  id: string;
}

interface FigmaVariable {
  id: string;
  name: string;
  resolvedType: 'FLOAT' | 'COLOR';
  valuesByMode: Record<
    string,
    number | FigmaColorValue | FigmaVariableAlias
  >;
}

interface FigmaCollection {
  id: string;
  name: string;
  defaultModeId: string;
  modes: FigmaMode[];
  variables: FigmaVariable[];
}

interface FigmaVariablesJson {
  schemaVersion: number;
  collections: FigmaCollection[];
}

interface Token<T = string> {
  name: string;
  value: T;
}

interface TypographyTokenValues {
  subgroup: string;
  name: string;
  desktopValue: number;
  mobileValue: number;
}

interface ColorFamilyVar {
  cssVarName: string;
  lightHex: string;
  darkHex: string;
}

interface ColorFamilyEntry {
  sortBucket: number;
  vars: ColorFamilyVar[];
}

interface ColorAliasEntry {
  aliasScssName: string;
  targetScssName: string;
}

const isFigmaVariableAlias = (val: unknown): val is FigmaVariableAlias => {
  return (
    typeof val === 'object'
    && val !== null
    && 'type' in val
    && (val as FigmaVariableAlias).type === 'VARIABLE_ALIAS'
    && 'id' in val
  );
};

const isFigmaColorValue = (val: unknown): val is FigmaColorValue => {
  const o = val as FigmaColorValue;

  return (
    typeof val === 'object'
    && val !== null
    && typeof o?.r === 'number'
    && typeof o?.g === 'number'
    && typeof o?.b === 'number'
    && typeof o?.a === 'number'
    && !isFigmaVariableAlias(val)
  );
};

// Helper function to extract numeric value from variable name for sorting
const extractNumericValue = (varName: string): number | null => {
  const match = varName.match(/-(\d+)$/);

  return match ? parseInt(match[1], 10) : null;
};

// Sort function for numeric variables (padding, spacing, etc.)
const sortNumericVariables = (a: Token<number>, b: Token<number>): number => {
  const numA = extractNumericValue(a.name);
  const numB = extractNumericValue(b.name);

  if (numA !== null && numB !== null) {
    return numA - numB;
  }

  if (numA !== null) {
    return -1;
  }

  if (numB !== null) {
    return 1;
  }

  return a.name.localeCompare(b.name);
};

const readFigmaVariablesFile = (filename: string): FigmaVariablesJson => {
  const content = readFileSync(filename, 'utf-8');

  return JSON.parse(content) as FigmaVariablesJson;
};

// Convert Figma rgba (0-1) to hex
const rgbaToHex = (c: FigmaColorValue): string => {
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);

  const rgbStr = [r, g, b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('');

  return `#${rgbStr}`;
};

// Parse both legacy and scoped variable paths.
// Legacy: "segment/global-rest" -> { group: "segment", tokenName: "rest" }
// Scoped: "global/segment/global-rest" -> { group: "segment", tokenName: "rest" }
const splitVariableName = (
  name: string,
): {group: string; tokenName: string} | null => {
  const parts = name.split('/').filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  const group = parts.length >= 3 ? parts[parts.length - 2] : parts[0];
  const tokenSegment = parts[parts.length - 1];
  const tokenName = tokenSegment.replace(/^global-/, '');

  return {group, tokenName};
};

const getPrefixedCssVarName = (name: string): string => `${NDWU_CSS_VAR_PREFIX}${name}`;

const getPrefixedColorCssVarName = (suffix: string): string => {
  return getPrefixedCssVarName(`color-${suffix}`);
};

const getTypographyCssVarName = (name: string): string => {
  return getPrefixedCssVarName(name);
};

const getColorScssVarSuffixFromCssVarName = (cssVarName: string): string => {
  const prefix = `${NDWU_CSS_VAR_PREFIX}color-`;

  return cssVarName.startsWith(prefix)
    ? cssVarName.slice(prefix.length)
    : cssVarName;
};

// Parse color variable name to { family, cssVarName }.
// New format: "global/brand/global-color-brand-5" -> family "brand", "--ndwu-color-brand-5"
// Old format: "brand/global-color-brand-5" -> family "brand", "--ndwu-color-brand-5"
const parseColorName = (
  name: string,
): {family: string; cssVarName: string; sortBucket: number} | null => {
  const parts = name.split('/').filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  const tokenIndex = parts.findIndex((p) => p.startsWith('global-color-'));

  if (tokenIndex >= 0) {
    const segment = parts[tokenIndex];
    const suffix = segment.replace(/^global-color-/, '');
    const family = tokenIndex > 0 ? parts[tokenIndex - 1] : suffix.replace(/-\d+$/, '');

    return {family, cssVarName: getPrefixedColorCssVarName(suffix), sortBucket: 0};
  }

  if (parts[0] === 'component') {
    return null;
  }

  // Old format: single slash, e.g. "brand/global-color-brand-5"
  const family = parts[0];
  const suffix = parts[parts.length - 1].replace(/^global-color-/, '');

  return {family, cssVarName: getPrefixedColorCssVarName(suffix), sortBucket: 0};
};

// Parse "alias/alias-color-text-description-default" -> "text-description-default" (SCSS token suffix for $name)
const parseAliasColorName = (name: string): string | null => {
  const legacyPrefix = 'alias/alias-color-';

  if (name.startsWith(legacyPrefix)) {
    return name.slice(legacyPrefix.length) || null;
  }

  const parts = name.split('/').filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  if (parts[0] !== 'alias') {
    return null;
  }

  const tokenSegment = parts[parts.length - 1];

  if (tokenSegment.includes('-color-')) {
    return tokenSegment;
  }

  return null;
};

const getCollection = (data: FigmaVariablesJson, name: string): FigmaCollection | null => {
  return data.collections.find((c) => c.name === name) ?? null;
};

const getModeNameToIdMap = (collection: FigmaCollection): Map<string, string> => {
  const modeNameToId = new Map<string, string>();

  for (const mode of collection.modes) {
    modeNameToId.set(mode.name, mode.modeId);
  }

  return modeNameToId;
};

const writeGeneratedScssFile = (outputFile: string, lines: string[]): void => {
  writeFileSync(outputFile, SCSS_CODEGEN_COMMENT + '\n\n' + lines.join('\n') + '\n', 'utf-8');
  console.log(`Created ${outputFile}`);
};

const appendGroupedLines = <T>(
  lines: string[],
  entries: T[],
  getSubgroup: (entry: T) => string,
  getLine: (entry: T) => string,
): void => {
  let previousSubgroup = '';

  for (const entry of entries) {
    const subgroup = getSubgroup(entry);

    if (previousSubgroup && previousSubgroup !== subgroup) {
      lines.push('');
    }

    lines.push(getLine(entry));
    previousSubgroup = subgroup;
  }
};

const sortColorVarsByCssVarName = (
  a: Pick<ColorFamilyVar, 'cssVarName'>,
  b: Pick<ColorFamilyVar, 'cssVarName'>,
): number => {
  const numA = extractNumericValue(a.cssVarName);
  const numB = extractNumericValue(b.cssVarName);

  if (numA !== null && numB !== null) {
    return numA - numB;
  }

  return a.cssVarName.localeCompare(b.cssVarName);
};

// --- Sizes collection -> padding, spacing, radius ---
const processSizes = (data: FigmaVariablesJson): void => {
  const collection = getCollection(data, 'Sizes');

  if (!collection) {
    return;
  }

  const modeId = collection.defaultModeId;
  const byGroup = new Map<string, Array<Token<number>>>();

  for (const v of collection.variables) {
    if (v.resolvedType !== 'FLOAT') {
      continue;
    }

    const parsed = splitVariableName(v.name);

    if (!parsed) {
      continue;
    }

    const raw = v.valuesByMode[modeId];

    if (typeof raw !== 'number') {
      continue;
    }

    const value = roundDownTo3Decimals(raw);
    const list = byGroup.get(parsed.group) ?? [];

    list.push({name: parsed.tokenName, value});
    byGroup.set(parsed.group, list);
  }

  const groups = ['padding', 'spacing', 'radius'];

  for (const groupName of groups) {
    const tokens = byGroup.get(groupName);

    if (!tokens || tokens.length === 0) {
      continue;
    }

    tokens.sort(sortNumericVariables);

    const lines = tokens.map(({name, value}) => `$${name}: ${value}px;`);
    const outputFile = join(OUTPUT_DIR, `${groupName}.scss`);

    writeFileSync(outputFile, SCSS_CODEGEN_COMMENT + '\n\n' + lines.join('\n') + '\n', 'utf-8');
    console.log(`Created ${outputFile}`);
  }
};

// --- Typography collection -> typography.scss ---
const collectTypographyTokensByMode = (
  collection: FigmaCollection,
  modeIds: string[],
  subgroupOrder: string[],
): Map<string, Map<string, Array<Token<number>>>> => {
  const byMode = new Map<string, Map<string, Array<Token<number>>>>();

  for (const modeId of modeIds) {
    byMode.set(modeId, new Map());
  }

  for (const variable of collection.variables) {
    if (variable.resolvedType !== 'FLOAT') {
      continue;
    }

    const parsed = splitVariableName(variable.name);

    if (!parsed || !subgroupOrder.includes(parsed.group)) {
      continue;
    }

    for (const modeId of modeIds) {
      const raw = variable.valuesByMode[modeId];
      const subgroupMap = byMode.get(modeId);

      if (typeof raw !== 'number' || !subgroupMap) {
        continue;
      }

      const list = subgroupMap.get(parsed.group) ?? [];

      list.push({name: parsed.tokenName, value: roundDownTo3Decimals(raw)});
      subgroupMap.set(parsed.group, list);
    }
  }

  for (const subgroupMap of byMode.values()) {
    for (const tokens of subgroupMap.values()) {
      tokens.sort(sortNumericVariables);
    }
  }

  return byMode;
};

const getTypographyTokenValues = (
  desktopMap: Map<string, Array<Token<number>>>,
  mobileMap: Map<string, Array<Token<number>>>,
  subgroupOrder: string[],
): TypographyTokenValues[] => {
  const tokens: TypographyTokenValues[] = [];

  for (const subgroup of subgroupOrder) {
    const desktopTokens = desktopMap.get(subgroup) ?? [];

    for (const {name, value: desktopValue} of desktopTokens) {
      const mobileToken = (mobileMap.get(subgroup) ?? []).find((token) => token.name === name);

      tokens.push({
        subgroup,
        name,
        desktopValue,
        mobileValue: mobileToken?.value ?? desktopValue,
      });
    }
  }

  return tokens;
};

const buildTypographyLines = (allTokens: TypographyTokenValues[]): string[] => {
  const unit = (subgroup: string): string => subgroup === 'fontWeight' ? '' : 'px';
  const lines: string[] = [
    '/* stylelint-disable custom-property-pattern,custom-property-empty-line-before */',
    ':root {',
  ];

  appendGroupedLines(
    lines,
    allTokens,
    ({subgroup}) => subgroup,
    ({subgroup, name, desktopValue}) => `  ${getTypographyCssVarName(name)}: ${desktopValue}${unit(subgroup)};`,
  );

  lines.push('}');
  lines.push('');

  const mobileOverrides = allTokens.filter(({desktopValue, mobileValue}) => desktopValue !== mobileValue);

  if (mobileOverrides.length > 0) {
    lines.push('/* Variables that are different @ mobile are overridden in the next block */');
    lines.push(`@media ${HANDSET_BREAKPOINT} {`);
    lines.push('  :root {');
    appendGroupedLines(
      lines,
      mobileOverrides,
      ({subgroup}) => subgroup,
      ({subgroup, name, mobileValue}) => `    ${getTypographyCssVarName(name)}: ${mobileValue}${unit(subgroup)};`,
    );
    lines.push('  }');
    lines.push('}');
    lines.push('');
  }

  appendGroupedLines(
    lines,
    allTokens,
    ({subgroup}) => subgroup,
    ({name}) => `$${name}: var(${getTypographyCssVarName(name)});`,
  );

  return lines;
};

const processTypography = (data: FigmaVariablesJson): void => {
  const collection = getCollection(data, 'Typography');

  if (!collection) {
    return;
  }

  const desktopModeId = collection.modes.find((mode) => mode.name === 'Desktop')?.modeId;
  const mobileModeId = collection.modes.find((mode) => mode.name === 'Mobile')?.modeId;

  if (!desktopModeId || !mobileModeId) {
    console.warn('Typography collection is missing Desktop or Mobile mode — falling back to defaultModeId');
  }

  const effectiveDesktopId = desktopModeId ?? collection.defaultModeId;
  const effectiveMobileId = mobileModeId ?? collection.defaultModeId;
  const subgroupOrder = ['fontSize', 'lineHeight', 'letterSpacing', 'fontWeight'];
  const byMode = collectTypographyTokensByMode(
    collection,
    [effectiveDesktopId, effectiveMobileId],
    subgroupOrder,
  );

  const desktopMap = byMode.get(effectiveDesktopId);
  const mobileMap = byMode.get(effectiveMobileId);

  if (!desktopMap || !mobileMap) {
    return;
  }

  const allTokens = getTypographyTokenValues(desktopMap, mobileMap, subgroupOrder);

  writeGeneratedScssFile(join(OUTPUT_DIR, 'typography.scss'), buildTypographyLines(allTokens));
};

// --- Colors collection -> themes + colors.scss ---
const collectPrimitiveColorFamilies = (
  collection: FigmaCollection,
  lightModeId: string,
  darkModeId: string,
): Map<string, ColorFamilyEntry> => {
  const byFamily = new Map<string, ColorFamilyEntry>();

  for (const variable of collection.variables) {
    if (variable.resolvedType !== 'COLOR') {
      continue;
    }

    const parsed = parseColorName(variable.name);
    const lightVal = variable.valuesByMode[lightModeId];
    const darkVal = variable.valuesByMode[darkModeId];

    if (!parsed || !isFigmaColorValue(lightVal) || !isFigmaColorValue(darkVal)) {
      continue;
    }

    const entry = byFamily.get(parsed.family) ?? {
      sortBucket: parsed.sortBucket,
      vars: [],
    };

    entry.vars.push({
      cssVarName: parsed.cssVarName,
      lightHex: rgbaToHex(lightVal),
      darkHex: rgbaToHex(darkVal),
    });

    byFamily.set(parsed.family, entry);
  }

  return byFamily;
};

const getSortedColorFamilies = (byFamily: Map<string, ColorFamilyEntry>): string[] => {
  return Array.from(byFamily.entries())
    .sort(([familyA, entryA], [familyB, entryB]) => {
      if (entryA.sortBucket !== entryB.sortBucket) {
        return entryA.sortBucket - entryB.sortBucket;
      }

      return familyA.localeCompare(familyB);
    })
    .map(([family]) => family);
};

const buildThemeColorLines = (
  mapName: '$light-theme-colors' | '$dark-theme-colors',
  heading: string,
  sortedFamilies: string[],
  byFamily: Map<string, ColorFamilyEntry>,
  valueKey: 'lightHex' | 'darkHex',
): string[] => {
  const lines = [heading, `${mapName}: (`];

  for (let familyIndex = 0; familyIndex < sortedFamilies.length; familyIndex++) {
    const family = sortedFamilies[familyIndex];
    const vars = byFamily.get(family)?.vars ?? [];

    for (let varIndex = 0; varIndex < vars.length; varIndex++) {
      const {cssVarName} = vars[varIndex];
      const isLast = familyIndex === sortedFamilies.length - 1 && varIndex === vars.length - 1;

      lines.push(`  ${cssVarName}: ${vars[varIndex][valueKey]}${isLast ? '' : ','}`);
    }

    if (familyIndex < sortedFamilies.length - 1) {
      lines.push('');
    }
  }

  lines.push(');');

  return lines;
};

const buildColorScssLines = (
  sortedFamilies: string[],
  byFamily: Map<string, ColorFamilyEntry>,
): string[] => {
  const lines: string[] = [];

  for (let familyIndex = 0; familyIndex < sortedFamilies.length; familyIndex++) {
    const family = sortedFamilies[familyIndex];
    const vars = [...(byFamily.get(family)?.vars ?? [])].sort(sortColorVarsByCssVarName);

    for (const {cssVarName} of vars) {
      lines.push(`$${getColorScssVarSuffixFromCssVarName(cssVarName)}: var(${cssVarName});`);
    }

    if (familyIndex < sortedFamilies.length - 1) {
      lines.push('');
    }
  }

  return lines;
};

const processColors = (data: FigmaVariablesJson): void => {
  const collection = getCollection(data, 'Colors');

  if (!collection) {
    return;
  }

  const modeNameToId = getModeNameToIdMap(collection);
  const lightModeId = modeNameToId.get('Light');
  const darkModeId = modeNameToId.get('Dark');

  if (lightModeId === undefined || darkModeId === undefined) {
    return;
  }

  const byFamily = collectPrimitiveColorFamilies(collection, lightModeId, darkModeId);
  const sortedFamilies = getSortedColorFamilies(byFamily);

  for (const family of sortedFamilies) {
    byFamily.get(family)?.vars.sort(sortColorVarsByCssVarName);
  }

  mkdirSync(join(OUTPUT_DIR, 'themes'), {recursive: true});

  writeGeneratedScssFile(
    join(OUTPUT_DIR, 'themes', '_light-theme.scss'),
    buildThemeColorLines(
      '$light-theme-colors',
      '// Light theme color variables',
      sortedFamilies,
      byFamily,
      'lightHex',
    ),
  );
  writeGeneratedScssFile(
    join(OUTPUT_DIR, 'themes', '_dark-theme.scss'),
    buildThemeColorLines(
      '$dark-theme-colors',
      '// Dark theme color variables',
      sortedFamilies,
      byFamily,
      'darkHex',
    ),
  );
  writeGeneratedScssFile(
    join(OUTPUT_DIR, 'colors.scss'),
    buildColorScssLines(sortedFamilies, byFamily),
  );
};

// --- Color aliases -> aliases.scss (after processColors) ---
const buildColorVariableMaps = (
  variables: FigmaVariable[],
  lightModeId: string,
): {idToVar: Map<string, FigmaVariable>; idToScssVarName: Map<string, string>} => {
  const idToVar = new Map<string, FigmaVariable>();
  const idToScssVarName = new Map<string, string>();

  for (const variable of variables) {
    idToVar.set(variable.id, variable);

    if (variable.resolvedType !== 'COLOR') {
      continue;
    }

    const parsed = parseColorName(variable.name);
    const lightVal = variable.valuesByMode[lightModeId];

    if (!parsed || !isFigmaColorValue(lightVal)) {
      continue;
    }

    idToScssVarName.set(
      variable.id,
      getColorScssVarSuffixFromCssVarName(parsed.cssVarName),
    );
  }

  return {idToVar, idToScssVarName};
};

const resolveAliasToScssVarName = (
  variableId: string,
  modeId: string,
  idToVar: Map<string, FigmaVariable>,
  idToScssVarName: Map<string, string>,
  visited: Set<string>,
): string | null => {
  if (visited.has(variableId)) {
    return null;
  }

  const variable = idToVar.get(variableId);

  if (!variable) {
    return null;
  }

  const value = variable.valuesByMode[modeId];

  if (isFigmaColorValue(value)) {
    return idToScssVarName.get(variableId) ?? null;
  }

  if (!isFigmaVariableAlias(value)) {
    return null;
  }

  visited.add(variableId);

  const target = resolveAliasToScssVarName(
    value.id,
    modeId,
    idToVar,
    idToScssVarName,
    visited,
  );

  visited.delete(variableId);

  return target;
};

const collectColorAliasEntries = (
  variables: FigmaVariable[],
  lightModeId: string,
  idToVar: Map<string, FigmaVariable>,
  idToScssVarName: Map<string, string>,
): ColorAliasEntry[] => {
  const aliasEntries: ColorAliasEntry[] = [];

  for (const variable of variables) {
    if (variable.resolvedType !== 'COLOR') {
      continue;
    }

    const aliasScssName = parseAliasColorName(variable.name);
    const lightValue = variable.valuesByMode[lightModeId];

    if (aliasScssName === null || !isFigmaVariableAlias(lightValue)) {
      continue;
    }

    const targetScssName = resolveAliasToScssVarName(
      lightValue.id,
      lightModeId,
      idToVar,
      idToScssVarName,
      new Set(),
    );

    if (targetScssName !== null) {
      aliasEntries.push({aliasScssName, targetScssName});
    }
  }

  aliasEntries.sort((a, b) => a.aliasScssName.localeCompare(b.aliasScssName));

  return aliasEntries;
};

const buildAliasLines = (aliasEntries: ColorAliasEntry[]): string[] => {
  const lines: string[] = ['@use \'styles/colors\';', ''];

  for (const {aliasScssName, targetScssName} of aliasEntries) {
    lines.push(`$${aliasScssName}: colors.$${targetScssName};`);
  }

  return lines;
};

const processColorAliases = (data: FigmaVariablesJson): void => {
  const collection = getCollection(data, 'Colors');

  if (!collection) {
    return;
  }

  const lightModeId = getModeNameToIdMap(collection).get('Light');

  if (lightModeId === undefined) {
    return;
  }

  const {idToVar, idToScssVarName} = buildColorVariableMaps(
    collection.variables,
    lightModeId,
  );

  const aliasEntries = collectColorAliasEntries(
    collection.variables,
    lightModeId,
    idToVar,
    idToScssVarName,
  );

  writeGeneratedScssFile(join(OUTPUT_DIR, 'aliases.scss'), buildAliasLines(aliasEntries));
};

const processFromFigmaFull = (data: FigmaVariablesJson): void => {
  processSizes(data);
  processTypography(data);
  processColors(data);
  processColorAliases(data);
};

const main = (): void => {
  mkdirSync(OUTPUT_DIR, {recursive: true});

  console.log('Converting Figma variables to SCSS files...\n');

  const data = readFigmaVariablesFile(INPUT_FILE);

  processFromFigmaFull(data);

  console.log('\n✅ Conversion complete!');
};

void main();
