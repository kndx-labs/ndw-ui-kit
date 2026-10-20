#!/usr/bin/env tsx

import {join} from 'node:path';
import chalk from 'chalk';
import {PICTOGRAM_SPRITE_FILENAME, SPRITE_PICTOGRAMS_DIR, SRC_LIB_ASSETS_DIR} from './conf';
import {buildSprite, listSpriteSourceFiles} from './utils/sprite-common';

const generateSprite = async (): Promise<void> => {
  const files = listSpriteSourceFiles(SPRITE_PICTOGRAMS_DIR, 'prepare-pictograms');

  const addedCount = await buildSprite({
    sourceDir: SPRITE_PICTOGRAMS_DIR,
    files,
    outputDir: SRC_LIB_ASSETS_DIR,
    outputFilename: PICTOGRAM_SPRITE_FILENAME,
  });

  console.log(chalk.green(`Generated pictogram sprite with ${addedCount} icons`));
  console.log(chalk.cyan(`Sprite file: ${join(SRC_LIB_ASSETS_DIR, PICTOGRAM_SPRITE_FILENAME)}`));
};

console.log(chalk.blue('Generating pictogram sprite...'));

generateSprite()
  .then(() => {
    console.log(chalk.green('Done!\n'));
  })
  .catch((error: unknown) => {
    console.error(chalk.red('Error generating pictogram sprite:'), error);
    process.exit(1);
  });
