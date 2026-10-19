#!/usr/bin/env tsx

import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {PICTOGRAM_EXPECTED_DIMENSIONS, PICTOGRAM_SUPPORTED_SUFFIXES, SPRITE_PICTOGRAMS_DIR, SRC_DIR} from './conf';
import {getCodegenComment} from './utils/fmt';
import {collectSpriteNameEntries, formatNameEntries} from './utils/sprite-names';

const OUTPUT_FILE = join(SRC_DIR, 'lib', 'pictogram-names.ts');

const main = (): void => {
  const entries = collectSpriteNameEntries({
    sourceDir: SPRITE_PICTOGRAMS_DIR,
    prepareScript: 'prepare-pictograms',
    supportedSuffixes: PICTOGRAM_SUPPORTED_SUFFIXES,
    expectedDimensions: PICTOGRAM_EXPECTED_DIMENSIONS,
  });

  const content = `
${getCodegenComment(__filename)}

export const NDWU_PICTOGRAM_NAME = {
${formatNameEntries(entries)}
} as const;

export type NdwuPictogramName = (typeof NDWU_PICTOGRAM_NAME)[keyof typeof NDWU_PICTOGRAM_NAME];
`.trimStart();

  writeFileSync(OUTPUT_FILE, content, 'utf-8');

  console.log(`✅ Generated ${entries.length} pictogram names`);
  console.log(`📁 Output file: ${OUTPUT_FILE}`);
};

main();
