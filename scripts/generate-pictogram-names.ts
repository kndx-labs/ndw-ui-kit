#!/usr/bin/env tsx

import {readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {EOL} from 'node:os';
import chalk from 'chalk';
import {PICTOGRAM_EXPECTED_DIMENSIONS, PICTOGRAM_SUPPORTED_SUFFIXES, SCRIPTS_DATA_DIR, SRC_DIR} from './conf';
import {getCodegenComment, stripExtension, toScreamingSnakeCase} from './utils/fmt';
import {isSvgFile} from './utils/svg';
import {validateSvgFile} from './utils/validate-svg-file';

const SPRITE_PICTOGRAMS_DIR = join(SCRIPTS_DATA_DIR, 'sprite-pictograms');
const OUTPUT_FILE = join(SRC_DIR, 'lib', 'pictogram-names.ts');

const main = (): void => {
  try {
    const files = readdirSync(SPRITE_PICTOGRAMS_DIR).filter(isSvgFile);

    if (files.length === 0) {
      console.error(`No SVG files found in ${SPRITE_PICTOGRAMS_DIR}`);
      console.error('Please run "npm run process-pictogram-icons" first.');
      process.exit(1);
    }

    files.sort();

    const declarations: string[] = [];

    for (const file of files) {
      const name = stripExtension(file);
      const filePath = join(SPRITE_PICTOGRAMS_DIR, file);

      const validation = validateSvgFile(file, PICTOGRAM_SUPPORTED_SUFFIXES, PICTOGRAM_EXPECTED_DIMENSIONS, filePath);

      if (!validation.isValid) {
        console.warn(chalk.yellow(`⚠️  Skipping "${file}": ${validation.skipReason}`));
        continue;
      }

      const normalizedName = name.replace(/ /g, '_');
      const key = toScreamingSnakeCase(normalizedName);

      declarations.push(`  ${key}: '${normalizedName}',`);
    }

    const content = `
${getCodegenComment(__filename)}

export const PICTOGRAM_NAME = {
${declarations.join(EOL)}
} as const;

export type NdwuPictogramName = (typeof PICTOGRAM_NAME)[keyof typeof PICTOGRAM_NAME];
`.trimStart();

    writeFileSync(OUTPUT_FILE, content, 'utf-8');

    console.log(`✅ Generated ${declarations.length} pictogram names`);
    console.log(`📁 Output file: ${OUTPUT_FILE}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Directory not found: ${SPRITE_PICTOGRAMS_DIR}`);
      console.error('Please run "npm run process-pictogram-icons" first.');
      process.exit(1);
    } else {
      throw error;
    }
  }
};

main();
