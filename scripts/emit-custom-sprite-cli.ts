#!/usr/bin/env tsx
/**
 * emit-custom-sprite-cli.ts
 *
 * Transpiles `scripts/build-custom-sprite.ts` into an ESM bundle
 * at `dist/ndw-ui-kit/tools/build-custom-sprite.mjs` using esbuild.
 *
 * Run as part of the publishable build:
 *   yarn run emit-custom-sprite-cli
 */

import path from 'node:path';
import {build} from 'esbuild';
import fs from 'fs-extra';
import {DIST_CUSTOM_SPRITE_CLI_FILE, SCRIPTS_DIR} from './conf';

const main = async (): Promise<void> => {
  const srcFile = path.join(SCRIPTS_DIR, 'build-custom-sprite.ts');
  const outFile = DIST_CUSTOM_SPRITE_CLI_FILE;

  await fs.ensureDir(path.dirname(outFile));

  console.log(`Transpiling ${srcFile} → ${outFile} ...`);

  await build({
    entryPoints: [srcFile],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    outfile: outFile,
    banner: {
      js: '#!/usr/bin/env node',
    },
    // Mark packages with native bindings (or that should remain runtime deps) as external.
    // svg-sprite uses @resvg/resvg-js which ships platform-specific .node files
    // that cannot be bundled by esbuild.
    // typescript is bundled in (so consumers don't need it installed) — it only
    // adds ~8 MB to the CLI artifact which is acceptable for a build tool.
    external: [
      '@angular/*',
      'svg-sprite',
      '@resvg/*',
    ],
  });

  // Make the output file executable
  await fs.chmod(outFile, 0o755);

  console.log('Done: emit-custom-sprite-cli');
};

main().catch((err: unknown) => {
  console.error('emit-custom-sprite-cli failed:', err);
  process.exit(1);
});
