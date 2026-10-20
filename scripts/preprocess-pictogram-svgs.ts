#!/usr/bin/env tsx

import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import chalk from 'chalk';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {ICONS_SRC_DIR, PICTOGRAM_EXPECTED_DIMENSIONS, SPRITE_PICTOGRAMS_DIR} from './conf';
import {extractAllSvgColors, matchPictogramPreset} from './utils/svg-colors';
import {isSvgFile} from './utils/svg';
import {validateSvgFile} from './utils/validate-svg-file';
import {postToWebhook} from './utils/post-to-webhook';

const NOTIFY_WEBHOOK_URL = process.env.NOTIFY_WEBHOOK_URL;

const INPUT_DIR = ICONS_SRC_DIR;
const OUTPUT_DIR = SPRITE_PICTOGRAMS_DIR;

function replacePictogramColor(content: string, color: string, cssVar: string): string {
  const regex = new RegExp(`(fill|stroke)="[^"]*${color}[^"]*"`, 'g');

  return content.replace(regex, `$1="var(${cssVar}, ${color})"`);
}

const main = async (): Promise<void> => {
  const {notify: cliNotify} = yargs(hideBin(process.argv))
    .boolean('notify')
    .default({notify: false})
    .parseSync();

  // Support both --notify flag and NOTIFY env var (for npm-run-all2 --env)
  const notify = cliNotify || process.env.NOTIFY === 'true';

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, {recursive: true});
  }

  const files = readdirSync(INPUT_DIR)
    .filter(isSvgFile)
    .filter(file => file.startsWith('pictogram_'));

  if (files.length === 0) {
    console.log('No pictogram SVG files found in', INPUT_DIR);

    return;
  }

  console.log(`Processing ${files.length} pictogram SVG files...`);

  const result: {processed: string[]; skipped: Array<{name: string; reason: string}>} = {
    processed: [],
    skipped: [],
  };

  for (const file of files) {
    const inputPath = join(INPUT_DIR, file);

    const validation = validateSvgFile(file, PICTOGRAM_EXPECTED_DIMENSIONS, inputPath);

    if (!validation.isValid) {
      result.skipped.push({name: file, reason: validation.skipReason || 'validation failed'});
      continue;
    }

    try {
      const content = readFileSync(inputPath, 'utf-8');

      const colors = extractAllSvgColors(content);
      const match = matchPictogramPreset(colors);

      if (match.matched === false) {
        result.skipped.push({
          name: file,
          reason: match.skipReason || 'Color validation failed',
        });
        continue;
      }

      let processedContent = content;

      processedContent = replacePictogramColor(processedContent, match.firstColor, '--pictogram-first-color');
      processedContent = replacePictogramColor(processedContent, match.secondColor, '--pictogram-second-color');

      const outputPath = join(OUTPUT_DIR, file);

      writeFileSync(outputPath, processedContent, 'utf-8');
      result.processed.push(file);
    } catch (error) {
      result.skipped.push({
        name: file,
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  console.log('✅ Successfully processed:', result.processed.length);
  console.log('❌ Skipped:', result.skipped.length);

  if (result.skipped.length > 0) {
    result.skipped.forEach(skipped => {
      console.log(`   - ${skipped.name}: ${skipped.reason}`);
    });
  }

  console.log(`📁 Processed pictograms saved to: ${OUTPUT_DIR}`);

  if (notify) {
    await postToWebhook(NOTIFY_WEBHOOK_URL, 'Pictogram Preprocessing Failures', result.skipped);
  }
};

console.log(chalk.blue('Processing pictogram SVGs...'));

void main()
  .then(() => {
    console.log(chalk.green('Done!\n'));
  });
