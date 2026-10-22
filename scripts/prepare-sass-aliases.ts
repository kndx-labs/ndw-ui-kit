import {lstat, mkdir, readlink, rm, symlink} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {CORE_PACKAGE_NAME, DIST_DIR, ROOT_DIR, SRC_DIR} from './conf';

const aliases = [
  {
    linkPath: resolve(ROOT_DIR, '.sass-aliases/src', CORE_PACKAGE_NAME),
    targetPath: resolve(SRC_DIR, 'lib'),
  },
  {
    linkPath: resolve(ROOT_DIR, '.sass-aliases/dist', CORE_PACKAGE_NAME),
    targetPath: DIST_DIR,
  },
];

const isMissingPath = (error: unknown): boolean => {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
};

async function ensureDirectorySymlink(linkPath: string, targetPath: string): Promise<void> {
  await mkdir(dirname(linkPath), {recursive: true});

  try {
    const stats = await lstat(linkPath);

    if (!stats.isSymbolicLink()) {
      throw new Error(`Refusing to replace non-symlink Sass alias: ${linkPath}`);
    }

    const currentTarget = resolve(dirname(linkPath), await readlink(linkPath));

    if (currentTarget === targetPath) {
      return;
    }

    await rm(linkPath);
  } catch (error) {
    if (!isMissingPath(error)) {
      throw error;
    }
  }

  await symlink(targetPath, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
}

async function main(): Promise<void> {
  for (const {linkPath, targetPath} of aliases) {
    await ensureDirectorySymlink(linkPath, targetPath);
  }

  console.log(`Prepared Sass aliases for ${CORE_PACKAGE_NAME} (source and dist).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
