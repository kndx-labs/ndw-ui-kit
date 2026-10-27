#!/usr/bin/env tsx

import chalk from 'chalk';
import {SPRITE_PICTOGRAMS_DIR} from './conf';
import {extractAllSvgColors, matchPictogramPreset} from './utils/sprite/svg-colors';
import {PICTOGRAM_EXPECTED_DIMENSIONS} from './utils/sprite/svg';
import {type SvgTransformResult, isPictogramFile, runSvgPreprocess} from './utils/sprite/preprocess';

function replacePictogramColor(content: string, color: string, cssVar: string): string {
  const regex = new RegExp(`(fill|stroke)="[^"]*${color}[^"]*"`, 'g');

  return content.replace(regex, `$1="var(${cssVar}, ${color})"`);
}

const transformPictogram = (content: string): SvgTransformResult => {
  const match = matchPictogramPreset(extractAllSvgColors(content));

  if (match.matched === false) {
    return {ok: false, reason: match.skipReason || 'Color validation failed'};
  }

  let processedContent = content;

  processedContent = replacePictogramColor(processedContent, match.firstColor, '--pictogram-first-color');
  processedContent = replacePictogramColor(processedContent, match.secondColor, '--pictogram-second-color');

  return {ok: true, content: processedContent};
};

runSvgPreprocess({
  label: 'pictogram',
  webhookTitle: 'Pictogram Preprocessing Failures',
  outputDir: SPRITE_PICTOGRAMS_DIR,
  include: isPictogramFile,
  expectedDimensions: PICTOGRAM_EXPECTED_DIMENSIONS,
  transform: transformPictogram,
})
  .catch((error: unknown) => {
    console.error(chalk.red('Pictogram preprocessing failed:'), error);
    process.exit(1);
  });
