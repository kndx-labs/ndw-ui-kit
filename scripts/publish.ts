#!/usr/bin/env tsx

import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {ROOT_DIR} from './conf';

const DIST_DIR = resolve(ROOT_DIR, 'dist/ndw-ui-kit');

if (!existsSync(DIST_DIR)) {
  process.stderr.write(`Error: ${DIST_DIR} not found. Run "yarn build:to-publish" first.\n`);
  process.exit(1);
}

execSync('yarn run verify:publish-artifacts', {stdio: 'inherit'});

execSync(`npm publish ${DIST_DIR}`, {stdio: 'inherit'});
