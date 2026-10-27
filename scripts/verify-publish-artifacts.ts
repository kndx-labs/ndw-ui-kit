#!/usr/bin/env tsx

import {existsSync, readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import type * as Sass from 'sass';
import {DIST_CUSTOM_SPRITE_CLI_FILE, DIST_DIR, DIST_SPRITE_ICONS_DIR} from './conf';

const {compile} = createRequire(require.resolve('@angular/build'))('sass') as typeof Sass;

const CLI_FILE = DIST_CUSTOM_SPRITE_CLI_FILE;
const SPRITE_SOURCE_DIR = DIST_SPRITE_ICONS_DIR;
const THEMES_FILE = join(DIST_DIR, 'styles/themes.scss');

const fail = (message: string): never => {
  process.stderr.write(`${message}\n`);
  process.exit(1);
};

if (!existsSync(DIST_DIR)) {
  fail(`Error: ${DIST_DIR} not found. Run "yarn build:to-publish" first.`);
}

if (!existsSync(CLI_FILE)) {
  fail(`Error: missing CLI artifact: ${CLI_FILE}. Run "yarn run emit-custom-sprite-cli".`);
}

if (!existsSync(SPRITE_SOURCE_DIR)) {
  fail(`Error: missing icon source directory: ${SPRITE_SOURCE_DIR}. Run "yarn run copy-custom-sprite-sources".`);
}

const svgFileCount = readdirSync(SPRITE_SOURCE_DIR).filter((file) => file.endsWith('.svg')).length;

if (svgFileCount === 0) {
  fail(`Error: no SVG files found in ${SPRITE_SOURCE_DIR}.`);
}

try {
  compile(THEMES_FILE);
} catch (err: unknown) {
  fail(`Error: ${THEMES_FILE} does not compile without load paths:\n${String(err)}`);
}

process.stdout.write(`OK: publish artifacts are present (${svgFileCount} sprite source SVGs).\n`);
