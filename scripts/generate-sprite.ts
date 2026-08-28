#!/usr/bin/env tsx

import {existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import chalk from 'chalk';
import {isSvgFile} from './utils/svg';
import {EXTRA_SPRITE_FILENAME, SCRIPTS_DATA_DIR, SPRITE_FILENAME, SRC_DIR} from './conf';
import {stripExtension} from './utils/fmt';
import {BASE_ICON_NAME} from '../src/lib/icon-names.base';
import {addFileToSpriter, compileSpriter, createSpriter} from './utils/sprite-builder';

const SPRITES_DIR = join(SCRIPTS_DATA_DIR, 'sprite-icons');
const SPRITE_OUTPUT_DIR = join(SRC_DIR, 'lib', 'assets');

/**
 * Generate SVG sprites for:
 * 1) bundled icons used by the library itself (default)
 * 2) all remaining icons (optional extra sprite)
 */
const generateSprite = async (): Promise<void> => {
  // Check if sprite-icons directory exists
  if (!existsSync(SPRITES_DIR)) {
    console.error(chalk.red(`Directory not found: ${SPRITES_DIR}`));
    console.error(chalk.red('Please run the `process-icons` script first.'));
    process.exit(1);
  }

  // Get all SVG files
  const files = readdirSync(SPRITES_DIR).filter(isSvgFile);

  if (files.length === 0) {
    console.error(chalk.red(`No SVG files found in ${SPRITES_DIR}`));
    console.error(chalk.red('Please run the `process-icons` script first.'));
    process.exit(1);
  }

  const bundledIconSet = new Set<string>(BASE_ICON_NAME);
  const coreFiles = files.filter((file) => bundledIconSet.has(stripExtension(file)));
  const extraFiles = files.filter((file) => !bundledIconSet.has(stripExtension(file)));

  const missingBaseIcons = BASE_ICON_NAME.filter((iconName) => !files.includes(`${iconName}.svg`));

  if (missingBaseIcons.length > 0) {
    console.error(chalk.red('Base icon allowlist contains unknown icon files:'));
    missingBaseIcons.forEach((iconName) => console.error(chalk.red(`  - ${iconName}.svg`)));
    process.exit(1);
  }

  const coreSpriter = createSpriter(SPRITE_OUTPUT_DIR, SPRITE_FILENAME);
  const extraSpriter = createSpriter(SPRITE_OUTPUT_DIR, EXTRA_SPRITE_FILENAME);

  const addedCore = coreFiles.filter((file) => addFileToSpriter(coreSpriter, SPRITES_DIR, file)).length;
  const addedExtra = extraFiles.filter((file) => addFileToSpriter(extraSpriter, SPRITES_DIR, file)).length;

  try {
    await compileSpriter(coreSpriter);
    await compileSpriter(extraSpriter);
  } catch (error) {
    console.error(chalk.red('Error generating sprite:'), error);
    process.exit(1);
  }

  console.log(chalk.green(`Generated core sprite with ${addedCore} icons`));
  console.log(chalk.cyan(`Sprite file: ${join(SPRITE_OUTPUT_DIR, SPRITE_FILENAME)}`));
  console.log(chalk.green(`Generated extra sprite with ${addedExtra} icons`));
  console.log(chalk.cyan(`Sprite file: ${join(SPRITE_OUTPUT_DIR, EXTRA_SPRITE_FILENAME)}`));
};

console.log(chalk.blue('Generating sprite file...'));

generateSprite()
  .then(() => {
    console.log(chalk.green('Done!\n'));
  })
  .catch((error) => {
    console.error(chalk.red('Error generating sprites:'), error);
    process.exit(1);
  });
