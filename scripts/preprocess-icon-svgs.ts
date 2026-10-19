#!/usr/bin/env tsx

/* eslint @typescript-eslint/no-unsafe-argument: 0, @typescript-eslint/no-unsafe-member-access: 0 */
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {Builder, parseString} from 'xml2js';
import {promisify} from 'node:util';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {ICONS_SRC_DIR, SPRITE_ICONS_DIR} from './conf';
import {STANDARD_ICON_SIZE_SUFFIX, isSvgFile} from './utils/svg';
import {normalizeColor} from './utils/fmt';
import {validateSvgFile} from './utils/validate-svg-file';
import {postToWebhook} from './utils/post-to-webhook';
import chalk from 'chalk';

const NOTIFY_WEBHOOK_URL = process.env.NOTIFY_WEBHOOK_URL;

const parseXML = promisify(parseString);

const INPUT_DIR = ICONS_SRC_DIR;
const OUTPUT_DIR = SPRITE_ICONS_DIR;

const SVG_CHILD_ELEMENTS = ['path', 'circle', 'rect', 'ellipse', 'line', 'polygon', 'polyline', 'g'] as const;

interface ScriptResult {
  processed: string[];
  skipped: Array<{name: string; reason: string}>;
}

/**
 * Recursively replace every fill/stroke color in the element tree with `toColor`.
 * Absent attributes and null-normalized values (none, transparent) are left as is.
 */
const replaceAllColors = (element: any, toColor: string): void => {
  if (normalizeColor(element.$?.fill) !== null) {
    element.$.fill = toColor;
  }

  if (normalizeColor(element.$?.stroke) !== null) {
    element.$.stroke = toColor;
  }

  for (const childType of SVG_CHILD_ELEMENTS) {
    if (element[childType]) {
      for (const child of (Array.isArray(element[childType]) ? element[childType] : [element[childType]])) {
        replaceAllColors(child, toColor);
      }
    }
  }
};

const buildXml = (obj: any): string => {
  const builder = new Builder({
    headless: true,
    renderOpts: {pretty: false},
  });

  return builder.buildObject(obj);
};

/**
 * Process a single SVG file
 */
const processSvgFile = async (filename: string): Promise<{success: boolean; reason?: string}> => {
  const inputPath = join(INPUT_DIR, filename);
  const outputPath = join(OUTPUT_DIR, filename);

  const validation = validateSvgFile(filename, STANDARD_ICON_SIZE_SUFFIX, STANDARD_ICON_SIZE_SUFFIX, inputPath);

  if (!validation.isValid) {
    return {
      success: false,
      reason: validation.skipReason || 'unsupported size suffix',
    };
  }

  try {
    const svgBuffer = readFileSync(inputPath);
    const parsed = await parseXML(svgBuffer.toString('utf-8')) as any;

    if (!parsed.svg) {
      return {success: false, reason: 'Invalid SVG structure'};
    }

    replaceAllColors(parsed.svg, 'currentColor');

    const processedXML = buildXml(parsed);

    writeFileSync(outputPath, processedXML, 'utf-8');

    return {success: true};
  } catch (error) {
    return {success: false, reason: error instanceof Error ? error.message : 'Unknown error'};
  }
};

/**
 * Main processing function
 */
const main = async (): Promise<void> => {
  const {notify: cliNotify} = yargs(hideBin(process.argv))
    .boolean('notify')
    .default({notify: false})
    .parseSync();

  // Support both --notify flag and NOTIFY env var (for npm-run-all2 --env)
  const notify = cliNotify || process.env.NOTIFY === 'true';

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, {recursive: true});
  }

  const files = readdirSync(INPUT_DIR)
    .filter(isSvgFile)
    .filter(file => !file.startsWith('pictogram'));

  if (files.length === 0) {
    console.log('No SVG files found in', INPUT_DIR);

    return;
  }

  console.log(`Processing ${files.length} SVG files...\n`);

  const result: ScriptResult = {
    processed: [],
    skipped: [],
  };

  for (const file of files) {
    const processResult = await processSvgFile(file);

    if (processResult.success) {
      result.processed.push(file);
    } else {
      result.skipped.push({
        name: file,
        reason: processResult.reason || 'Unknown reason',
      });
    }
  }

  // Print summary
  console.log('✅ Successfully processed:', result.processed.length);
  console.log('\n❌ Skipped (cannot be converted):', result.skipped.length);

  if (result.skipped.length > 0) {
    for (const skipped of result.skipped) {
      console.log(`   - ${skipped.name}: ${skipped.reason}`);
    }
  }

  console.log(`\n📁 Processed icons saved to: ${OUTPUT_DIR}`);

  if (notify) {
    await postToWebhook(NOTIFY_WEBHOOK_URL, 'Icon Preprocessing Failures', result.skipped);
  }
};

console.log(chalk.blue('Processing icon SVGs...'));

void main()
  .then(() => {
    console.log(chalk.green('Done!\n'));
  });
