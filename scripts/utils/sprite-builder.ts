import {join} from 'node:path';
import chalk from 'chalk';
import SVGSpriter from 'svg-sprite';
import {isSpriteCompileResult, writeCompileResult} from './sprite.types';
import {prepareSvgForSprite} from './svg';

/**
 * Create a new SVGSpriter instance configured for inline symbol mode.
 *
 * @param spriteOutputDir - The directory where the sprite file will be written.
 * @param spriteFileName  - The filename of the generated sprite.
 */
export const createSpriter = (spriteOutputDir: string, spriteFileName: string): SVGSpriter.SVGSpriter => {
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
export const addFileToSpriter = (spriter: SVGSpriter.SVGSpriter, sourceDir: string, file: string): boolean => {
  const filePath = join(sourceDir, file);

  const preparedSvg = prepareSvgForSprite(filePath);

  if ('reason' in preparedSvg) {
    if (preparedSvg.reason === 'missing-svg-tag') {
      console.warn(chalk.yellow(`WARN Could not find SVG tag in ${file}, skipping`));

      return false;
    }

    console.warn(chalk.yellow(`WARN Could not extract dimensions for ${file}, skipping`));

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
export const compileSpriter = (spriter: SVGSpriter.SVGSpriter): Promise<void> => {
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
