import {existsSync, mkdirSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import chalk from 'chalk';
import SVGSpriter from 'svg-sprite';
import {isSvgFile, prepareSvgForSprite} from './svg';

export interface BuildSpriteOptions {
  sourceDir: string;
  files: readonly string[];
  outputDir: string;
  outputFilename: string;
}

// ---------------------------------------------------------------------------
// svg-sprite compile result
// ---------------------------------------------------------------------------

interface SpriteCompileResource {
  path: string;
  contents: string | NodeJS.ArrayBufferView;
}

type SpriteCompileMode = Record<string, SpriteCompileResource>;

type SpriteCompileResult = Record<string, SpriteCompileMode>;

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isSpriteCompileResource = (value: unknown): value is SpriteCompileResource => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return typeof value.path === 'string' && (typeof value.contents === 'string' || ArrayBuffer.isView(value.contents));
};

const isSpriteCompileMode = (value: unknown): value is SpriteCompileMode => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.values(value).every(isSpriteCompileResource);
};

const isSpriteCompileResult = (value: unknown): value is SpriteCompileResult => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.values(value).every(isSpriteCompileMode);
};

const writeCompileResult = (result: SpriteCompileResult): void => {
  for (const resources of Object.values(result)) {
    for (const {path: outputPath, contents} of Object.values(resources)) {
      mkdirSync(dirname(outputPath), {recursive: true});
      writeFileSync(outputPath, contents);
    }
  }
};

// ---------------------------------------------------------------------------
// svg-sprite wrapper
// ---------------------------------------------------------------------------

/**
 * Create a new SVGSpriter instance configured for inline symbol mode.
 *
 * @param spriteOutputDir - The directory where the sprite file will be written.
 * @param spriteFileName  - The filename of the generated sprite.
 */
const createSpriter = (spriteOutputDir: string, spriteFileName: string): SVGSpriter.SVGSpriter => {
  const config = {
    mode: {
      symbol: {
        inline: true,
        dest: spriteOutputDir,
        sprite: spriteFileName,
        dimension: {
          attributes: {
            width: true,
            height: true,
          },
        },
      },
    },
    shape: {
      dimension: {
        attributes: true,
      },
    },
  };

  return new SVGSpriter(config);
};

/**
 * Add a single SVG file to a spriter instance.
 *
 * @param spriter  - The SVGSpriter instance.
 * @param sourceDir - Directory that contains the SVG file.
 * @param file     - The SVG filename (e.g. "wifi_signal_1_L.svg").
 * @returns `true` when the file was successfully added, `false` when it was skipped.
 */
const addFileToSpriter = (spriter: SVGSpriter.SVGSpriter, sourceDir: string, file: string): boolean => {
  const filePath = join(sourceDir, file);

  const preparedSvg = prepareSvgForSprite(filePath);

  if ('reason' in preparedSvg) {
    if (preparedSvg.reason === 'missing-svg-tag') {
      console.error(chalk.red(`Could not find SVG tag in ${file}`));

      return false;
    }

    console.error(chalk.red(`Could not extract dimensions for ${file}`));

    return false;
  }

  spriter.add(filePath, null, preparedSvg.content);

  return true;
};

/**
 * Compile a spriter and write the resulting sprite file(s) to disk.
 *
 * @param spriter - The SVGSpriter instance to compile.
 */
const compileSpriter = (spriter: SVGSpriter.SVGSpriter): Promise<void> => {
  return new Promise((resolve, reject) => {
    const typedSpriter = spriter as SVGSpriter.SVGSpriter & {
      compile(callback: (error: Error | null, result?: unknown) => void): void;
    };

    typedSpriter.compile((error, result) => {
      if (error) {
        reject(error instanceof Error ? error : new Error(String(error)));

        return;
      }

      if (!isSpriteCompileResult(result)) {
        reject(new Error('No result from sprite compilation'));

        return;
      }

      writeCompileResult(result);

      resolve();
    });
  });
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

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
 * Returns number of files added to the sprite.
 *
 * @throws When any file cannot be prepared: a sprite missing a symbol would not match the generated names.
 */
export const buildSprite = async (options: BuildSpriteOptions): Promise<number> => {
  const {sourceDir, files, outputDir, outputFilename} = options;
  const spriter = createSpriter(outputDir, outputFilename);
  const failedFiles = files.filter((file) => !addFileToSpriter(spriter, sourceDir, file));

  if (failedFiles.length > 0) {
    throw new Error(`${failedFiles.length} file(s) could not be added to ${outputFilename}`);
  }

  await compileSpriter(spriter);

  return files.length;
};
