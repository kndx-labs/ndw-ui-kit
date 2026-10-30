#!/usr/bin/env tsx

// Post-processes all SCSS asset files in dist/ndw-ui-kit before publishing:
// - strips comments, because they can reference private links (e.g., issue-tracker items);
// - rewrites root-relative `@use`/`@forward` paths (resolved via `styleIncludePaths` in the repo)
//   to paths relative to the current file, so consumers need no `includePaths`/`loadPaths`.
//
// This script uses `postcss-scss` to parse files as SCSS ASTs.
// Both block (/* */) and single-line (//) comments are removed.

import {existsSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {basename, dirname, join, relative, resolve, sep} from 'node:path';
import {glob} from 'fast-glob';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import {DIST_CHARTS_DIR, DIST_DIR, PACKAGE_SCOPE} from './conf';

const URL_PATTERN = /^(['"])(.+?)\1/;

const stripCommentsPlugin: postcss.Plugin = {
  postcssPlugin: 'strip-comments',
  Comment(node) {
    node.remove();
  },
};

const isFile = (path: string): boolean => existsSync(path) && statSync(path).isFile();

const resolvesFrom = (dir: string, url: string): boolean => {
  const target = resolve(dir, url);
  const parent = dirname(target);
  const name = basename(target);

  return [
    target,
    `${target}.scss`,
    join(parent, `_${name}.scss`),
    join(target, 'index.scss'),
    join(target, '_index.scss'),
  ].some(isFile);
};

const rewriteUrl = (file: string, url: string, distDir: string): string => {
  const fileDir = dirname(file);

  if (url.startsWith('sass:') || url.startsWith(`${PACKAGE_SCOPE}/`) || resolvesFrom(fileDir, url)) {
    return url;
  }

  if (!resolvesFrom(distDir, url)) {
    throw new Error(`Cannot resolve "${url}" in ${file}`);
  }

  const relativeUrl = relative(fileDir, resolve(distDir, url)).replaceAll(sep, '/');

  return relativeUrl.startsWith('.') ? relativeUrl : `./${relativeUrl}`;
};

const rewriteImportsPlugin = (file: string, distDir: string): postcss.Plugin => {
  const rewrite = (node: postcss.AtRule): void => {
    node.params = node.params.replace(URL_PATTERN, (_, quote: string, url: string) => {
      return `${quote}${rewriteUrl(file, url, distDir)}${quote}`;
    });
  };

  return {
    postcssPlugin: 'rewrite-imports',
    AtRule: {
      use: rewrite,
      forward: rewrite,
    },
  };
};

async function main(): Promise<void> {
  for (const distDir of [DIST_DIR, DIST_CHARTS_DIR]) {
    const files = await glob('**/*.scss', {cwd: distDir, absolute: true});

    for (const file of files) {
      const original = readFileSync(file, 'utf-8');
      const result = await postcss([stripCommentsPlugin, rewriteImportsPlugin(file, distDir)]).process(original, {
        syntax: postcssScss,
        from: file,
        to: file,
      });

      writeFileSync(file, result.css, 'utf-8');
    }

    console.log(`Stripped comments from ${files.length} SCSS file(s) in ${distDir}.`);
  }
}

main().catch((err: unknown) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
