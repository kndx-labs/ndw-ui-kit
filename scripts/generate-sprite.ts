#!/usr/bin/env tsx

import {join} from 'node:path';
import chalk from 'chalk';
import {EXTRA_SPRITE_FILENAME, SPRITE_FILENAME, SPRITE_ICONS_DIR, SRC_LIB_ASSETS_DIR} from './conf';
import {stripExtension} from './utils/fmt';
import {buildSprite, listSpriteSourceFiles} from './utils/sprite-common';
import {BASE_ICON_NAME} from '../src/lib/icon-names.base';

/**
 * Generate SVG sprites for:
 * 1) bundled icons used by the library itself (default)
 * 2) all remaining icons (optional extra sprite)
 */
const generateSprite = async (): Promise<void> => {
  const files = listSpriteSourceFiles(SPRITE_ICONS_DIR, 'prepare-icons');

  const missingBaseIcons = BASE_ICON_NAME.filter((iconName) => !files.includes(`${iconName}.svg`));

  if (missingBaseIcons.length > 0) {
    console.error(chalk.red('Base icon allowlist contains unknown icon files:'));
    missingBaseIcons.forEach((iconName) => console.error(chalk.red(`  - ${iconName}.svg`)));
    process.exit(1);
  }

  const bundledIconSet = new Set<string>(BASE_ICON_NAME);
  const coreFiles = files.filter((file) => bundledIconSet.has(stripExtension(file)));
  const extraFiles = files.filter((file) => !bundledIconSet.has(stripExtension(file)));

  const addedCore = await buildSprite({
    sourceDir: SPRITE_ICONS_DIR,
    files: coreFiles,
    outputDir: SRC_LIB_ASSETS_DIR,
    outputFilename: SPRITE_FILENAME,
  });
  const addedExtra = await buildSprite({
    sourceDir: SPRITE_ICONS_DIR,
    files: extraFiles,
    outputDir: SRC_LIB_ASSETS_DIR,
    outputFilename: EXTRA_SPRITE_FILENAME,
  });

  console.log(chalk.green(`Generated core sprite with ${addedCore} icons`));
  console.log(chalk.cyan(`Sprite file: ${join(SRC_LIB_ASSETS_DIR, SPRITE_FILENAME)}`));
  console.log(chalk.green(`Generated extra sprite with ${addedExtra} icons`));
  console.log(chalk.cyan(`Sprite file: ${join(SRC_LIB_ASSETS_DIR, EXTRA_SPRITE_FILENAME)}`));
};

console.log(chalk.blue('Generating sprite file...'));

generateSprite()
  .then(() => {
    console.log(chalk.green('Done!\n'));
  })
  .catch((error: unknown) => {
    console.error(chalk.red('Error generating sprites:'), error);
    process.exit(1);
  });
