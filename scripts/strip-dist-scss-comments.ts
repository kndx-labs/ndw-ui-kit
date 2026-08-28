#!/usr/bin/env tsx

// Strips comments from all SCSS asset files in dist/ndw-ui-kit
// This should be done before publishing the library to npmjs.org,
// because comments in the SCSS files can reference private links (e.g., issue-tracker items).
//
// This script uses `postcss-scss` to parse files as SCSS ASTs.
// Both block (/* */) and single-line (//) comments are removed.

import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {glob} from 'fast-glob';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import {ROOT_DIR} from './conf';

const DIST_DIR = resolve(ROOT_DIR, 'dist/ndw-ui-kit');

const stripCommentsPlugin: postcss.Plugin = {
  postcssPlugin: 'strip-comments',
  Comment(node) {
    node.remove();
  },
};

async function main(): Promise<void> {
  const files = await glob('**/*.scss', {cwd: DIST_DIR, absolute: true});

  for (const file of files) {
    const original = readFileSync(file, 'utf-8');
    const result = await postcss([stripCommentsPlugin]).process(original, {
      syntax: postcssScss,
      from: file,
      to: file,
    });

    writeFileSync(file, result.css, 'utf-8');
  }

  console.log(`Stripped comments from ${files.length} SCSS file(s).`);
}

main().catch((err: unknown) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
