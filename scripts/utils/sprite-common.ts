import {existsSync, readdirSync} from 'node:fs';
import chalk from 'chalk';
import {addFileToSpriter, compileSpriter, createSpriter} from './sprite-builder';
import {isSvgFile} from './svg';

export interface BuildSpriteOptions {
  sourceDir: string;
  files: readonly string[];
  outputDir: string;
  outputFilename: string;
}

/**
 * List SVG files in a preprocessed sprite source directory.
 * Exits the process when the directory is missing or contains no SVG files.
 *
 * @param sourceDir     - Directory with preprocessed SVG files.
 * @param prepareScript - Package script that populates `sourceDir`, shown in the error hint.
 */
export const listSpriteSourceFiles = (sourceDir: string, prepareScript: string): string[] => {
  const hint = `Please run \`yarn ${prepareScript}\` first.`;

  if (!existsSync(sourceDir)) {
    console.error(chalk.red(`Directory not found: ${sourceDir}`));
    console.error(chalk.red(hint));
    process.exit(1);
  }

  const files = readdirSync(sourceDir).filter(isSvgFile);

  if (files.length === 0) {
    console.error(chalk.red(`No SVG files found in ${sourceDir}`));
    console.error(chalk.red(hint));
    process.exit(1);
  }

  return files;
};

/**
 * Pack `files` from `sourceDir` into a single symbol sprite and write it to disk.
 *
 * @returns Number of files added to the sprite (files that failed preparation are skipped with a warning).
 */
export const buildSprite = async (options: BuildSpriteOptions): Promise<number> => {
  const {sourceDir, files, outputDir, outputFilename} = options;
  const spriter = createSpriter(outputDir, outputFilename);
  const addedCount = files.filter((file) => addFileToSpriter(spriter, sourceDir, file)).length;

  await compileSpriter(spriter);

  return addedCount;
};
