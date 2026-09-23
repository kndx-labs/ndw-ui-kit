#!/usr/bin/env tsx

import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {EOL} from 'node:os';
import chalk from 'chalk';
import fg from 'fast-glob';
import ts from 'typescript';
import {SCRIPTS_DATA_DIR, SRC_DIR} from './conf';
import {getCodegenComment, stripExtension, toScreamingSnakeCase} from './utils/fmt';
import {isSvgFile} from './utils/svg';
import {ALWAYS_INCLUDE_BASE_ICON_NAMES} from '../src/lib/icon-names.base.manual';

const SRC_LIB_DIR = join(SRC_DIR, 'lib');
const SPRITE_ICONS_DIR = join(SCRIPTS_DATA_DIR, 'sprite-icons');
const OUTPUT_FILE = join(SRC_LIB_DIR, 'icon-names.base.ts');

const ICON_MEMBER_RE = /\bICON_NAME\.([A-Z0-9_]+)/g;

const extractMembersFromText = (text: string): Set<string> => {
  const members = new Set<string>();
  let match: RegExpExecArray | null = null;

  while ((match = ICON_MEMBER_RE.exec(text)) !== null) {
    members.add(match[1]);
  }

  return members;
};

const isIconNameTypeNode = (node: ts.TypeNode | undefined): boolean => {
  if (!node) {
    return false;
  }

  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    return node.typeName.text === 'NdwuIconName';
  }

  if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
    return node.types.some(isIconNameTypeNode);
  }

  if (ts.isParenthesizedTypeNode(node)) {
    return isIconNameTypeNode(node.type);
  }

  return false;
};

const collectFromTsSource = (filePath: string): {members: Set<string>; inferredValues: Set<string>} => {
  const sourceText = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const members = new Set<string>();
  const inferredValues = new Set<string>();

  const addIfStringLiteral = (node: ts.Node | undefined): void => {
    if (!node) {
      return;
    }

    if (ts.isStringLiteralLike(node)) {
      inferredValues.add(node.text);
    }
  };

  const visit = (node: ts.Node): void => {
    if (
      ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'ICON_NAME'
    ) {
      members.add(node.name.text);
    }

    if (ts.isCallExpression(node) && node.typeArguments?.some(isIconNameTypeNode)) {
      addIfStringLiteral(node.arguments[0]);
    }

    if (ts.isVariableDeclaration(node) && isIconNameTypeNode(node.type)) {
      addIfStringLiteral(node.initializer);
    }

    if (ts.isAsExpression(node) && isIconNameTypeNode(node.type)) {
      addIfStringLiteral(node.expression);
    }

    if (ts.isTypeAssertionExpression(node) && isIconNameTypeNode(node.type)) {
      addIfStringLiteral(node.expression);
    }

    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === 'template') {
      if (ts.isStringLiteralLike(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer)) {
        extractMembersFromText(node.initializer.text).forEach((member) => members.add(member));
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return {members, inferredValues};
};

const buildIconCatalog = (): {memberToValue: Map<string, string>; knownValues: Set<string>} => {
  if (!existsSync(SPRITE_ICONS_DIR)) {
    console.error(chalk.red(`Directory not found: ${SPRITE_ICONS_DIR}`));
    console.error(chalk.red('Please run the `process-icons` script first.'));
    process.exit(1);
  }

  const files = readdirSync(SPRITE_ICONS_DIR).filter(isSvgFile);

  if (files.length === 0) {
    console.error(chalk.red(`No SVG files found in ${SPRITE_ICONS_DIR}`));
    console.error(chalk.red('Please run the `process-icons` script first.'));
    process.exit(1);
  }

  const memberToValue = new Map<string, string>();
  const knownValues = new Set<string>();

  files.forEach((file) => {
    const iconValue = stripExtension(file).replace(/ /g, '_');
    const iconMember = toScreamingSnakeCase(iconValue);

    memberToValue.set(iconMember, iconValue);
    knownValues.add(iconValue);
  });

  return {memberToValue, knownValues};
};

const toBaseIconFileContent = (iconValues: readonly string[]): string => {
  const entries = iconValues.map((value) => `  '${value}',`).join(EOL);

  return `
${getCodegenComment(__filename)}

/*
 * List of icons used by ndw-ui-kit components (e.g., \`eye-on\` / \`eye-off\` for the input with type="password").
 * Those icons are bundled into a "core" SVG sprite. The \`<ndwu-icon>\` expects the core SVG sprite file to be available.
 * All other icons are bundled into a separate "extra" SVG sprite which can be optionally included by the library consumer.
 *
 * [!] This file is generated from real usage in \`src/lib\` + \`ALWAYS_INCLUDE_BASE_ICON_NAMES\`.
 */
export const BASE_ICON_NAME = [
${entries}
] as const;

export type NdwuBaseIconName = (typeof BASE_ICON_NAME)[number];
`.trimStart();
};

const parseCurrentBaseIconValues = (content: string): Set<string> => {
  const iconValues = new Set<string>();
  const regex = /'([^']+)'/g;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(content)) !== null) {
    iconValues.add(match[1]);
  }

  return iconValues;
};

const printCheckDiff = (prevValues: Set<string>, nextValues: Set<string>): void => {
  const added = [...nextValues].filter((icon) => !prevValues.has(icon)).sort();
  const removed = [...prevValues].filter((icon) => !nextValues.has(icon)).sort();

  if (added.length > 0) {
    console.error(chalk.green('Added icons:'));
    added.forEach((icon) => console.error(chalk.green(`  + ${icon}`)));
  }

  if (removed.length > 0) {
    console.error(chalk.red('Removed icons:'));
    removed.forEach((icon) => console.error(chalk.red(`  - ${icon}`)));
  }
};

const main = (): void => {
  const checkOnly = process.argv.includes('--check');
  const {memberToValue, knownValues} = buildIconCatalog();
  const usedMembers = new Set<string>();
  const inferredValues = new Set<string>();

  const htmlFiles = fg.sync('**/*.html', {cwd: SRC_LIB_DIR, absolute: true});

  htmlFiles.forEach((filePath) => {
    const fileContent = readFileSync(filePath, 'utf-8');

    extractMembersFromText(fileContent).forEach((member) => usedMembers.add(member));
  });

  const tsFiles = fg.sync('**/*.ts', {cwd: SRC_LIB_DIR, absolute: true});

  tsFiles.forEach((filePath) => {
    const result = collectFromTsSource(filePath);

    result.members.forEach((member) => usedMembers.add(member));
    result.inferredValues.forEach((value) => inferredValues.add(value));
  });

  const unknownMembers = [...usedMembers].filter((member) => !memberToValue.has(member)).sort();

  if (unknownMembers.length > 0) {
    console.error(chalk.red('Unknown ICON_NAME members detected in src/lib:'));
    unknownMembers.forEach((member) => console.error(chalk.red(`  - ICON_NAME.${member}`)));
    process.exit(1);
  }

  const unknownInferredValues = [...inferredValues].filter((value) => !knownValues.has(value)).sort();

  if (unknownInferredValues.length > 0) {
    console.error(chalk.red('Unknown inferred NdwuIconName string values detected in src/lib:'));
    unknownInferredValues.forEach((value) => console.error(chalk.red(`  - ${value}`)));
    process.exit(1);
  }

  const unknownManualValues = [...ALWAYS_INCLUDE_BASE_ICON_NAMES].filter((value) => !knownValues.has(value)).sort();

  if (unknownManualValues.length > 0) {
    console.error(chalk.red('Manual always-include icon list contains unknown icon values:'));
    unknownManualValues.forEach((value) => console.error(chalk.red(`  - ${value}`)));
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const resolvedMemberValues = [...usedMembers].map((member) => memberToValue.get(member)!);
  const mergedValues = new Set<string>([
    ...resolvedMemberValues,
    ...inferredValues,
    ...ALWAYS_INCLUDE_BASE_ICON_NAMES,
  ]);

  const sortedValues = [...mergedValues].sort();
  const nextContent = toBaseIconFileContent(sortedValues);

  if (checkOnly) {
    const currentContent = existsSync(OUTPUT_FILE) ? readFileSync(OUTPUT_FILE, 'utf-8') : '';

    if (currentContent !== nextContent) {
      console.error(chalk.red(`BASE_ICON_NAME is out of date: ${OUTPUT_FILE}`));
      printCheckDiff(parseCurrentBaseIconValues(currentContent), new Set(sortedValues));
      process.exit(1);
    }

    console.log(chalk.green(`BASE_ICON_NAME is up-to-date (${sortedValues.length} icons)`));

    return;
  }

  writeFileSync(OUTPUT_FILE, nextContent, 'utf-8');
  console.log(chalk.green(`Generated ${OUTPUT_FILE} with ${sortedValues.length} icons`));
};

main();
