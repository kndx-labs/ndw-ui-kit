import {join} from 'node:path';
import {EOL} from 'node:os';
import chalk from 'chalk';
import {stripExtension, toScreamingSnakeCase} from '../fmt';
import {listSpriteSourceFiles} from './build';
import {validateSvgFile} from './svg';

export interface SpriteNameEntry {
  key: string;
  value: string;
}

export interface CollectSpriteNamesOptions {
  sourceDir: string;
  prepareScript: string;
  expectedDimensions: Readonly<Record<string, number>>;
}

/**
 * Build sorted `KEY: 'value'` entries for every SVG in a sprite source directory.
 * The directory holds preprocessed files only, so any file failing validation is a pipeline bug:
 * the process exits instead of emitting names that would not match the sprite.
 */
export const collectSpriteNameEntries = (options: CollectSpriteNamesOptions): SpriteNameEntry[] => {
  const {sourceDir, prepareScript, expectedDimensions} = options;
  const files = listSpriteSourceFiles(sourceDir, prepareScript).sort();
  const entries: SpriteNameEntry[] = [];
  const invalidFiles: string[] = [];

  for (const file of files) {
    const validation = validateSvgFile(file, join(sourceDir, file), expectedDimensions);

    if (!validation.isValid) {
      invalidFiles.push(`${file}: ${validation.skipReason}`);
      continue;
    }

    // svg-sprite sanitizes spaces to underscores in symbol ids; mirror that here
    // so the name value matches the sprite's `id` attribute exactly.
    const value = stripExtension(file).replace(/ /g, '_');

    entries.push({key: toScreamingSnakeCase(value), value});
  }

  if (invalidFiles.length > 0) {
    console.error(chalk.red(`Invalid SVG files in ${sourceDir}:`));
    invalidFiles.forEach((line) => console.error(chalk.red(`  - ${line}`)));
    process.exit(1);
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
