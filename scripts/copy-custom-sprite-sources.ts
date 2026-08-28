#!/usr/bin/env tsx
/**
 * copy-custom-sprite-sources.ts
 *
 * Copies the raw SVG source files required by the consumer-facing CLI
 * (`ndw-ui-kit-build-sprite`) into the published package folder so that
 * consumers can generate custom sprites without cloning the repository.
 *
 * Published layout:
 *   dist/ndw-ui-kit/assets/sprite-icons/<icon>.svg
 *
 * Run as part of the publishable build:
 *   yarn run copy-custom-sprite-sources
 */

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const main = async (): Promise<void> => {
  const rootDir = path.resolve(__dirname, '..');
  const sourceDir = path.join(rootDir, 'scripts/data/sprite-icons');
  const targetDir = path.join(rootDir, 'dist/ndw-ui-kit/assets/sprite-icons');

  if (!(await fs.pathExists(sourceDir))) {
    console.error(`Source directory not found: ${sourceDir}`);
    console.error('Please run `yarn run prepare-icons` first.');
    process.exit(1);
  }

  await fs.ensureDir(targetDir);
  await fs.copy(sourceDir, targetDir, {overwrite: true});

  const files = await fs.readdir(targetDir);

  console.log(`Copied ${files.length} SVG source file(s) to ${targetDir}`);
  console.log('Done: copy-custom-sprite-sources');
};

main().catch((err: unknown) => {
  console.error('copy-custom-sprite-sources failed:', err);
  process.exit(1);
});
