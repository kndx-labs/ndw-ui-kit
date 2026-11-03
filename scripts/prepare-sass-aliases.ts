import {mkdir, rm, symlink} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {CORE_PACKAGE_NAME, DIST_DIR, SASS_ALIASES_DIR, SRC_DIR} from './conf';

const aliases = [
  {
    linkPath: resolve(SASS_ALIASES_DIR, 'src', CORE_PACKAGE_NAME),
    targetPath: resolve(SRC_DIR, 'lib'),
  },
  {
    linkPath: resolve(SASS_ALIASES_DIR, 'dist', CORE_PACKAGE_NAME),
    targetPath: DIST_DIR,
  },
];

async function main(): Promise<void> {
  await rm(SASS_ALIASES_DIR, {force: true, recursive: true});

  for (const {linkPath, targetPath} of aliases) {
    await mkdir(dirname(linkPath), {recursive: true});
    await symlink(targetPath, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
  }

  console.log(`Prepared Sass aliases for ${CORE_PACKAGE_NAME} (source and dist).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
