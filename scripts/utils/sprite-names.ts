import {join} from 'node:path';
import {EOL} from 'node:os';
import chalk from 'chalk';
import {stripExtension, toScreamingSnakeCase} from './fmt';
import {listSpriteSourceFiles} from './sprite-common';
import {validateSvgFile} from './validate-svg-file';

export interface SpriteNameEntry {
  key: string;
  value: string;
}

export interface CollectSpriteNamesOptions {
  sourceDir: string;
  prepareScript: string;
  supportedSuffixes: Set<string> | Readonly<Record<string, number>>;
  expectedDimensions: Readonly<Record<string, number>>;
}

/**
 * Build sorted `KEY: 'value'` entries for every valid SVG in a sprite source directory.
 * Files with an unsupported size suffix or unexpected dimensions are skipped with a warning.
 */
export const collectSpriteNameEntries = (options: CollectSpriteNamesOptions): SpriteNameEntry[] => {
  const {sourceDir, prepareScript, supportedSuffixes, expectedDimensions} = options;
  const files = listSpriteSourceFiles(sourceDir, prepareScript).sort();
  const entries: SpriteNameEntry[] = [];

  for (const file of files) {
    const validation = validateSvgFile(file, supportedSuffixes, expectedDimensions, join(sourceDir, file));

    if (!validation.isValid) {
      console.warn(chalk.yellow(`⚠️  Skipping "${file}": ${validation.skipReason}`));
      continue;
    }

    // svg-sprite sanitizes spaces to underscores in symbol ids; mirror that here
    // so the name value matches the sprite's `id` attribute exactly.
    const value = stripExtension(file).replace(/ /g, '_');

    entries.push({key: toScreamingSnakeCase(value), value});
  }

  return entries;
};

/**
 * Render entries as the body of a TypeScript object literal (one `  KEY: 'value',` per line).
 */
export const formatNameEntries = (entries: readonly SpriteNameEntry[]): string => {
  return entries
    .map((entry) => `  ${entry.key}: '${entry.value}',`)
    .join(EOL);
};
