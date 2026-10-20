import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import chalk from 'chalk';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {ICONS_SRC_DIR} from '../../conf';
import {postToWebhook} from '../post-to-webhook';
import {type SvgSkipKind, isSvgFile, replaceXlinkHref, validateSvgFile} from './svg';

export type SvgTransformResult = {ok: true; content: string} | {ok: false; reason: string};

export interface SvgPreprocessOptions {
  // Human-readable pipeline name used in logs, e.g. 'icon' or 'pictogram'
  label: string;
  webhookTitle: string;
  outputDir: string;
  include: (file: string) => boolean;
  expectedDimensions: Readonly<Record<string, number>>;
  transform: (content: string) => SvgTransformResult | Promise<SvgTransformResult>;
}

interface SkippedFile {
  name: string;
  reason: string;
}

interface SvgPreprocessResult {
  processed: string[];
  skipped: Record<SvgSkipKind, SkippedFile[]>;
}

type FileOutcome = {ok: true} | {ok: false; kind: SvgSkipKind; reason: string};

const PICTOGRAM_FILE_PREFIX = 'pictogram_';

/**
 * Route a source SVG to a pipeline: `pictogram_*` files are pictograms, everything else is an icon.
 */
export const isPictogramFile = (file: string): boolean => {
  return file.startsWith(PICTOGRAM_FILE_PREFIX);
};

const NOTIFY_WEBHOOK_URL = process.env.NOTIFY_WEBHOOK_URL;

const parseNotifyFlag = (): boolean => {
  const {notify: cliNotify} = yargs(hideBin(process.argv))
    .boolean('notify')
    .default({notify: false})
    .parseSync();

  // Support both --notify flag and NOTIFY env var (for npm-run-all2 --env)
  return cliNotify || process.env.NOTIFY === 'true';
};

/**
 * Create `outputDir` and remove SVGs left by previous runs, so the output reflects only the current sources.
 * Non-SVG files (e.g. `.gitkeep`) are kept.
 */
const resetOutputDir = (outputDir: string): void => {
  mkdirSync(outputDir, {recursive: true});

  for (const file of readdirSync(outputDir).filter(isSvgFile)) {
    rmSync(join(outputDir, file));
  }
};

const processFile = async (file: string, options: SvgPreprocessOptions): Promise<FileOutcome> => {
  const inputPath = join(ICONS_SRC_DIR, file);
  const validation = validateSvgFile(file, inputPath, options.expectedDimensions);

  if (!validation.isValid) {
    return {ok: false, kind: validation.kind, reason: validation.skipReason};
  }

  try {
    const transformed = await options.transform(readFileSync(inputPath, 'utf-8'));

    if (!transformed.ok) {
      return {ok: false, kind: 'invalid', reason: transformed.reason};
    }

    const filename = join(options.outputDir, file);
    const content = replaceXlinkHref(transformed.content);

    writeFileSync(filename, content, 'utf-8');

    return {ok: true};
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';

    return {ok: false, kind: 'invalid', reason};
  }
};

const printSkipped = (title: string, files: readonly SkippedFile[]): void => {
  if (files.length === 0) {
    return;
  }

  console.log(`\n${title}: ${files.length}`);

  for (const {name, reason} of files) {
    console.log(`   - ${name}: ${reason}`);
  }
};

const printSummary = (result: SvgPreprocessResult, options: SvgPreprocessOptions): void => {
  console.log('✅ Successfully processed:', result.processed.length);
  printSkipped('⚠️  Skipped (unsupported)', result.skipped.unsupported);
  printSkipped('❌ Invalid', result.skipped.invalid);
  console.log(`\n📁 Processed ${options.label}s saved to: ${options.outputDir}`);
};

const preprocess = async (options: SvgPreprocessOptions): Promise<SvgPreprocessResult> => {
  const result: SvgPreprocessResult = {
    processed: [],
    skipped: {unsupported: [], invalid: []},
  };

  resetOutputDir(options.outputDir);

  const files = readdirSync(ICONS_SRC_DIR)
    .filter(isSvgFile)
    .filter(options.include);

  if (files.length === 0) {
    console.log(`No ${options.label} SVG files found in`, ICONS_SRC_DIR);

    return result;
  }

  console.log(`Processing ${files.length} ${options.label} SVG files...\n`);

  for (const file of files) {
    const outcome = await processFile(file, options);

    if (outcome.ok) {
      result.processed.push(file);
    } else {
      result.skipped[outcome.kind].push({name: file, reason: outcome.reason});
    }
  }

  return result;
};

/**
 * Validate and transform source SVGs of one pipeline into `outputDir`.
 *
 * Unsupported files are skipped with a warning; invalid files fail the run (`process.exitCode = 1`)
 * after the summary is printed and, with `--notify`, posted to the webhook.
 */
export const runSvgPreprocess = async (options: SvgPreprocessOptions): Promise<void> => {
  const notify = parseNotifyFlag();

  console.log(chalk.blue(`Processing ${options.label} SVGs...`));

  const result = await preprocess(options);

  printSummary(result, options);

  if (notify) {
    const skipped = [...result.skipped.invalid, ...result.skipped.unsupported];

    await postToWebhook(NOTIFY_WEBHOOK_URL, options.webhookTitle, skipped);
  }

  if (result.skipped.invalid.length > 0) {
    console.error(chalk.red(`\n${result.skipped.invalid.length} invalid ${options.label} SVG(s), failing the build.`));
    process.exitCode = 1;

    return;
  }

  console.log(chalk.green('Done!\n'));
};
