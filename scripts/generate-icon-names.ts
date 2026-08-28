#!/usr/bin/env tsx

import {readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {EOL} from 'node:os';
import chalk from 'chalk';
import {SCRIPTS_DATA_DIR, SRC_DIR} from './conf';
import {BASE_ICON_NAME} from '../src/lib/icon-names.base';
import {getCodegenComment, stripExtension, toScreamingSnakeCase} from './utils/fmt';
import {
  KNOWN_SUFFIXES_STR,
  STANDARD_ICON_SIZE_SUFFIX,
  extractIconSizeSuffix,
  extractSvgDimensions,
  isSvgFile,
} from './utils/svg';

const SPRITE_ICONS_DIR = join(SCRIPTS_DATA_DIR, 'sprite-icons');
const OUTPUT_FILE = join(SRC_DIR, 'lib', 'icon-names.ts');

const main = (): void => {
  try {
    const files = readdirSync(SPRITE_ICONS_DIR).filter(isSvgFile);

    if (files.length === 0) {
      console.error(`No SVG files found in ${SPRITE_ICONS_DIR}`);
      console.error('Please run "npm run process-icons" first to process the icons.');
      process.exit(1);
    }

    // Sort files alphabetically for consistent output
    files.sort();

    // Generate TypeScript const object + type
    const declarations: string[] = [];
    const iconEntries: Array<{key: string; value: string}> = [];

    for (const file of files) {
      const name = stripExtension(file);
      const suffix = extractIconSizeSuffix(name);

      if (suffix === undefined || !(suffix in STANDARD_ICON_SIZE_SUFFIX)) {
        console.warn(chalk.yellow(`⚠️  Skipping "${file}": no recognised size suffix (${KNOWN_SUFFIXES_STR})`));
        continue;
      }

      const expectedSize = STANDARD_ICON_SIZE_SUFFIX[suffix];
      const dims = extractSvgDimensions(join(SPRITE_ICONS_DIR, file));

      if (dims === undefined) {
        console.warn(chalk.yellow(`⚠️  Skipping "${file}": could not determine SVG dimensions`));
        continue;
      }

      if (dims.width !== expectedSize || dims.height !== expectedSize) {
        console.warn(
          chalk.yellow(
            `⚠️  Skipping "${file}": dimensions ${dims.width}×${dims.height}px don't match expected ${expectedSize}×${expectedSize}px for suffix _${suffix}`,
          ),
        );
        continue;
      }

      // svg-sprite sanitizes spaces to underscores in symbol ids; mirror that here
      // so the icon value matches the sprite's `id` attribute exactly.
      const normalizedName = name.replace(/ /g, '_');
      const key = toScreamingSnakeCase(normalizedName);

      declarations.push(`  ${key}: '${normalizedName}',`);
      iconEntries.push({key, value: normalizedName});
    }

    const valueToEntry = new Map(iconEntries.map((entry) => [entry.value, entry]));

    const missingBundledIcons = BASE_ICON_NAME.filter((iconName) => !valueToEntry.has(iconName));

    if (missingBundledIcons.length > 0) {
      console.error(chalk.red('Bundled icon allowlist contains unknown icon names:'));
      missingBundledIcons.forEach((iconName) => console.error(chalk.red(`  - ${iconName}`)));
      process.exit(1);
    }

    const bundledSet = new Set<string>(BASE_ICON_NAME);
    const extraDeclarations = iconEntries
      .filter((entry) => !bundledSet.has(entry.value))
      .map((entry) => `  ${entry.key}: '${entry.value}',`);

    const content: string = `
      ${getCodegenComment(__filename)}

import {BASE_ICON_NAME} from './icon-names.base';

export const ICON_NAME = {
${declarations.join(EOL)}
} as const;

export const EXTRA_ICON_NAME = {
${extraDeclarations.join(EOL)}
} as const;

export const ICON_NAMES = Object.values(ICON_NAME);
export const BASE_ICON_NAMES = BASE_ICON_NAME;

export type {BaseIconName} from './icon-names.base';
export type AllIconName = (typeof ICON_NAME)[keyof typeof ICON_NAME];

export type IconName = AllIconName;
`.trimStart();

    writeFileSync(OUTPUT_FILE, content, 'utf-8');

    console.log(`✅ Generated ${declarations.length} icon names`);
    console.log(`📁 Output file: ${OUTPUT_FILE}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Directory not found: ${SPRITE_ICONS_DIR}`);
      console.error('Please run "npm run process-icons" first to process the icons.');
      process.exit(1);
    } else {
      throw error;
    }
  }
};

main();
