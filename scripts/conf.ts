import * as path from 'node:path';
import {existsSync} from 'node:fs';

// We assume that this file will always be in the './scripts' directory.
export const SCRIPTS_DIR: string = path.resolve(__dirname);

// Load scripts/.env for local dev (no-op in CI, where vars are injected).
// Uses the Node 22 built-in loader — no dotenv dependency.
const DOTENV_PATH = path.resolve(SCRIPTS_DIR, '.env');

if (existsSync(DOTENV_PATH)) {
  process.loadEnvFile(DOTENV_PATH);
}

export const requireEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable "${name}" is required but not set.`);
  }

  return value;
};
export const SCRIPTS_DATA_DIR: string = path.resolve(SCRIPTS_DIR, 'data');
// Raw SVGs synced from Figma (icons and pictograms together)
export const ICONS_SRC_DIR: string = path.resolve(SCRIPTS_DATA_DIR, 'icons');
// Preprocessed SVGs, ready to be packed into sprites
export const SPRITE_ICONS_DIR: string = path.resolve(SCRIPTS_DATA_DIR, 'sprite-icons');
export const SPRITE_PICTOGRAMS_DIR: string = path.resolve(SCRIPTS_DATA_DIR, 'sprite-pictograms');

export const ROOT_DIR: string = path.resolve(SCRIPTS_DIR, '..');
export const SRC_DIR: string = path.resolve(ROOT_DIR, 'src');
export const SRC_LIB_ASSETS_DIR: string = path.resolve(SRC_DIR, 'lib/assets');

export const PACKAGE_SCOPE = '@ndw-ui-kit';
export const CORE_PACKAGE_NAME = `${PACKAGE_SCOPE}/core`;
export const CHARTS_PACKAGE_NAME = `${PACKAGE_SCOPE}/charts`;

export const DIST_ROOT_DIR: string = path.resolve(ROOT_DIR, 'dist');
export const DIST_DIR: string = path.resolve(DIST_ROOT_DIR, 'ndw-ui-kit');
export const DIST_CHARTS_DIR: string = path.resolve(DIST_ROOT_DIR, 'ndw-ui-kit-charts');
// Scratch space for release checks (consumer smoke builds, registry tarballs); ignored with dist
export const DIST_TEMP_DIR: string = path.resolve(DIST_ROOT_DIR, '.tmp');
export const SRC_CHARTS_PACKAGE_JSON: string = path.resolve(SRC_DIR, 'charts/package.json');
export const DIST_SPRITE_ICONS_DIR: string = path.resolve(DIST_DIR, 'assets/sprite-icons');
export const DIST_CUSTOM_SPRITE_CLI_FILE: string = path.resolve(DIST_DIR, 'tools/build-custom-sprite.mjs');

export const SPRITE_FILENAME = 'ndw-ui-kit.sprite.svg';
export const EXTRA_SPRITE_FILENAME = 'ndw-ui-kit.extra.sprite.svg';
export const PICTOGRAM_SPRITE_FILENAME = 'ndw-ui-kit.pictogram.sprite.svg';

// Matches Breakpoints.Handset from @angular/cdk/layout
// @see https://github.com/angular/components/blob/main/src/cdk/layout/breakpoints.ts
// dprint-ignore
export const HANDSET_BREAKPOINT = [
  '(max-width: 599.99px) and (orientation: portrait)',
  '(max-width: 959.99px) and (orientation: landscape)',
]
  .join(', ');
