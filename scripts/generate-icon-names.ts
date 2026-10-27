#!/usr/bin/env tsx

import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import chalk from 'chalk';
import {SPRITE_ICONS_DIR, SRC_DIR} from './conf';
import {BASE_ICON_NAME} from '../src/lib/icon-names.base';
import {getCodegenComment} from './utils/fmt';
import {collectSpriteNameEntries, formatNameEntries} from './utils/sprite/names';
import {ICON_EXPECTED_DIMENSIONS} from './utils/sprite/svg';

const OUTPUT_FILE = join(SRC_DIR, 'lib', 'icon-names.ts');

const main = (): void => {
  const entries = collectSpriteNameEntries({
    sourceDir: SPRITE_ICONS_DIR,
    prepareScript: 'prepare-icons',
    expectedDimensions: ICON_EXPECTED_DIMENSIONS,
  });

  const knownValues = new Set(entries.map((entry) => entry.value));
  const missingBundledIcons = BASE_ICON_NAME.filter((iconName) => !knownValues.has(iconName));

  if (missingBundledIcons.length > 0) {
    console.error(chalk.red('Bundled icon allowlist contains unknown icon names:'));
    missingBundledIcons.forEach((iconName) => console.error(chalk.red(`  - ${iconName}`)));
    process.exit(1);
  }

  const bundledSet = new Set<string>(BASE_ICON_NAME);
  const extraEntries = entries.filter((entry) => !bundledSet.has(entry.value));

  const content: string = `
      ${getCodegenComment(__filename)}

import {BASE_ICON_NAME} from './icon-names.base';

export const NDWU_ICON_NAME = {
${formatNameEntries(entries)}
} as const;

export const NDWU_EXTRA_ICON_NAME = {
${formatNameEntries(extraEntries)}
} as const;

export const NDWU_ICON_NAMES = Object.values(NDWU_ICON_NAME);
export const NDWU_BASE_ICON_NAMES = BASE_ICON_NAME;

export type {NdwuBaseIconName} from './icon-names.base';
export type NdwuAllIconName = (typeof NDWU_ICON_NAME)[keyof typeof NDWU_ICON_NAME];

export type NdwuIconName = NdwuAllIconName;
`.trimStart();

  writeFileSync(OUTPUT_FILE, content, 'utf-8');

  console.log(`✅ Generated ${entries.length} icon names`);
  console.log(`📁 Output file: ${OUTPUT_FILE}`);
};

main();
