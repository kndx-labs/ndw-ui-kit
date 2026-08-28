import {existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import chalk from 'chalk';
import {addFileToSpriter, compileSpriter, createSpriter} from './sprite-builder';
import {isSvgFile} from './svg';

export interface SpriteOptions {
  spritesDir: string;
  spriteOutputDir: string;
  spriteFilename: string;
  spriteName: string;
}

export function generateSprite(options: SpriteOptions): void {
  const {spritesDir, spriteOutputDir, spriteFilename, spriteName} = options;

  if (!existsSync(spritesDir)) {
    console.error(chalk.red(`Directory not found: ${spritesDir}`));
    console.error(chalk.red(`Please run the \`process-${spriteName}\` script first.`));
    process.exit(1);
  }

  const files = readdirSync(spritesDir).filter(isSvgFile);

  if (files.length === 0) {
    console.error(chalk.red(`No SVG files found in ${spritesDir}`));
    process.exit(1);
  }

  const spriter = createSpriter(spriteOutputDir, spriteFilename);
  let processedCount = 0;

  files.forEach((file) => {
    if (addFileToSpriter(spriter, spritesDir, file)) {
      processedCount++;
    }
  });

  void compileSpriter(spriter)
    .then(() => {
      console.log(chalk.green(`✅ Generated ${spriteName} sprite with ${processedCount} icons`));
      console.log(chalk.cyan(`📁 Sprite file: ${join(spriteOutputDir, spriteFilename)}`));
      console.log(chalk.green('Done!\n'));
    })
    .catch((error: unknown) => {
      console.error(chalk.red(`Error generating ${spriteName} sprite:`), error);
      process.exit(1);
    });
}
