/**
 * ndw-ui-kit-build-sprite
 *
 * CLI tool for consumers to generate a custom SVG sprite containing
 * only a subset of the extra icons shipped with ndw-ui-kit.
 *
 * Usage:
 *   npx ndw-ui-kit-build-sprite --config ./my-icons.json --out src/assets/my-custom.sprite.svg
 *
 * NB: this file is bundled into the published package (see `emit-custom-sprite-cli.ts`).
 * It must not import `conf.ts` (directly or transitively).
 */

import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import chalk from 'chalk';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {buildSprite} from './utils/sprite-common';

// ---------------------------------------------------------------------------
// Resolve the directory that contains the sprite icon SVG source files.
// When installed as an npm package the layout is:
//   <package_root>/tools/build-custom-sprite.mjs  ← this file (compiled, ESM)
//   <package_root>/assets/sprite-icons/            ← source SVG data
//
// When running from the repo via `tsx scripts/build-custom-sprite.ts` the
// sprite-icons directory lives under `scripts/data/sprite-icons/`.
// ---------------------------------------------------------------------------

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const PACKAGE_SPRITE_ICONS_DIR = path.resolve(currentDir, '../assets/sprite-icons');
const REPO_SPRITE_ICONS_DIR = path.resolve(currentDir, 'data/sprite-icons');

const resolveIconSourceDir = (): string => {
  if (existsSync(PACKAGE_SPRITE_ICONS_DIR)) {
    return PACKAGE_SPRITE_ICONS_DIR;
  }

  if (existsSync(REPO_SPRITE_ICONS_DIR)) {
    return REPO_SPRITE_ICONS_DIR;
  }

  console.error(chalk.red('Could not locate sprite-icons source directory.'));
  console.error(chalk.red(`Checked: ${PACKAGE_SPRITE_ICONS_DIR}`));
  console.error(chalk.red(`Checked: ${REPO_SPRITE_ICONS_DIR}`));
  process.exit(1);
};

// ---------------------------------------------------------------------------
// Config loading
// ---------------------------------------------------------------------------

interface CustomSpriteConfig {
  icons: readonly string[];
}

/**
 * Load icon names from a JSON config file.
 *
 * Expected shape: `{ "icons": ["wifi_signal_1_L", "usb_L"] }`
 */
const loadConfig = (configPath: string): CustomSpriteConfig => {
  const resolved = path.resolve(configPath);

  if (!existsSync(resolved)) {
    console.error(chalk.red(`Config file not found: ${resolved}`));
    process.exit(1);
  }

  if (!resolved.endsWith('.json')) {
    console.error(chalk.red(`Config file must be a JSON file (.json): ${resolved}`));
    process.exit(1);
  }

  try {
    const raw = readFileSync(resolved, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;

    if (
      typeof parsed !== 'object'
      || parsed === null
      || !Array.isArray((parsed as Record<string, unknown>).icons)
    ) {
      console.error(chalk.red(`Invalid config at ${resolved}: expected { "icons": string[] }`));
      process.exit(1);
    }

    return parsed as CustomSpriteConfig;
  } catch (err) {
    console.error(chalk.red(`Failed to read config at ${resolved}: ${(err as Error).message}`));
    process.exit(1);
  }
};

// ---------------------------------------------------------------------------
// Icon validation
// ---------------------------------------------------------------------------

/**
 * Build the set of valid icon names from the SVG files present in the source
 * directory. This is the ground truth — if the file exists, the icon is valid.
 */
const buildValidIconSet = (sourceDir: string): Set<string> => {
  const svgFiles = readdirSync(sourceDir).filter((f) => f.endsWith('.svg'));

  return new Set(svgFiles.map((f) => f.replace(/\.svg$/, '')));
};

const validateIcons = (
  iconNames: readonly string[],
  validNames: Set<string>,
): {valid: string[]; invalid: string[]} => {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const name of iconNames) {
    if (validNames.has(name)) {
      valid.push(name);
    } else {
      invalid.push(name);
    }
  }

  return {valid, invalid};
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async (): Promise<void> => {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 --config <path> --out <path>')
    .option('config', {
      alias: 'c',
      type: 'string',
      description: 'Path to JSON icon config file',
      demandOption: true,
    })
    .option('out', {
      alias: 'o',
      type: 'string',
      description: 'Output path for the generated sprite SVG file',
      demandOption: true,
    })
    .help()
    .parseAsync();

  const configPath = argv.config;
  const outPath = path.resolve(argv.out);

  const outDir = path.dirname(outPath);
  const outFile = path.basename(outPath);

  // Load config
  console.log(chalk.blue(`Loading config from ${configPath}...`));

  const config = loadConfig(configPath);

  if (!config.icons || config.icons.length === 0) {
    console.error(chalk.red('Config "icons" list is empty. Nothing to generate.'));
    process.exit(1);
  }

  // Resolve source directory and build the valid-name set from actual SVG files
  const sourceDir = resolveIconSourceDir();
  const validNames = buildValidIconSet(sourceDir);

  const {valid, invalid} = validateIcons(config.icons, validNames);

  if (invalid.length > 0) {
    console.error(chalk.red('Unknown icon name(s) — no matching SVG found in the package:'));
    invalid.forEach((name) => console.error(chalk.red(`  ✗ ${name}`)));
    console.error(
      chalk.yellow('\nValid icon names are the values of NDWU_EXTRA_ICON_NAME exported from @ndw-ui-kit/core.'),
    );
    process.exit(1);
  }

  console.log(chalk.green(`✓ All ${valid.length} icon name(s) are valid.`));

  // Build sprite
  console.log(chalk.blue(`Building sprite with ${valid.length} icon(s)...`));

  let addedCount = 0;

  try {
    addedCount = await buildSprite({
      sourceDir,
      files: valid.map((iconName) => `${iconName}.svg`),
      outputDir: outDir,
      outputFilename: outFile,
    });
  } catch (err) {
    console.error(chalk.red('Sprite compilation failed:'), err);
    process.exit(1);
  }

  console.log(chalk.green(`✓ Generated custom sprite with ${addedCount} icon(s)`));
  console.log(chalk.cyan(`  → ${outPath}`));
};

main().catch((err: unknown) => {
  console.error(chalk.red('Unexpected error:'), err);
  process.exit(1);
});
