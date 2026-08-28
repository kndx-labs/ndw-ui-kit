#!/usr/bin/env tsx

import {join} from 'node:path';
import chalk from 'chalk';
import {PICTOGRAM_SPRITE_FILENAME, SCRIPTS_DATA_DIR, SRC_DIR} from './conf';
import {generateSprite} from './utils/sprite-common';

const SPRITES_DIR = join(SCRIPTS_DATA_DIR, 'sprite-pictograms');
const SPRITE_OUTPUT_DIR = join(SRC_DIR, 'lib', 'assets');

console.log(chalk.blue('Generating pictogram sprite...'));
generateSprite({
  spritesDir: SPRITES_DIR,
  spriteOutputDir: SPRITE_OUTPUT_DIR,
  spriteFilename: PICTOGRAM_SPRITE_FILENAME,
  spriteName: 'pictogram',
});
