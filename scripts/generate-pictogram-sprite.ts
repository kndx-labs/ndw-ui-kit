#!/usr/bin/env tsx

import chalk from 'chalk';
import {PICTOGRAM_SPRITE_FILENAME, SPRITE_PICTOGRAMS_DIR, SRC_LIB_ASSETS_DIR} from './conf';
import {generateSprite} from './utils/sprite-common';

console.log(chalk.blue('Generating pictogram sprite...'));
generateSprite({
  spritesDir: SPRITE_PICTOGRAMS_DIR,
  spriteOutputDir: SRC_LIB_ASSETS_DIR,
  spriteFilename: PICTOGRAM_SPRITE_FILENAME,
  spriteName: 'pictogram',
});
