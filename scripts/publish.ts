#!/usr/bin/env tsx

import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {DIST_DIR, ROOT_DIR} from './conf';

const SRC_PACKAGE_JSON = resolve(ROOT_DIR, 'src/lib/package.json');
const DIST_PACKAGE_JSON = resolve(DIST_DIR, 'package.json');
const RELEASE_BRANCH = 'master';
const PACKAGE_SCOPE = '@ndw-ui-kit/';
const SEMVER_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

interface PackageInfo {
  name: string;
  version: string;
}

const fail = (message: string): never => {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
};

const run = (file: string, args: string[]): string => {
  return execFileSync(file, args, {cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
};

const runInherit = (file: string, args: string[]): void => {
  execFileSync(file, args, {cwd: ROOT_DIR, stdio: 'inherit'});
};

const readPackageInfo = (path: string): PackageInfo => {
  const {name, version} = JSON.parse(readFileSync(path, 'utf8')) as PackageInfo;

  if (typeof name !== 'string' || !name.startsWith(PACKAGE_SCOPE)) {
    fail(`${path}: package name must start with "${PACKAGE_SCOPE}", got ${JSON.stringify(name)}.`);
  }

  if (typeof version !== 'string' || !SEMVER_RE.test(version)) {
    fail(`${path}: invalid version ${JSON.stringify(version)}.`);
  }

  return {name, version};
};

const assertGitState = (allowDirty: boolean): void => {
  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const status = run('git', ['status', '--porcelain']);
  const problems: string[] = [];

  if (branch !== RELEASE_BRANCH) {
    problems.push(`current branch is "${branch}", expected "${RELEASE_BRANCH}"`);
  }

  if (status !== '') {
    problems.push(`working tree is not clean:\n${status}`);
  }

  if (problems.length === 0) {
    return;
  }

  if (allowDirty) {
    process.stderr.write(`Warning (--allow-dirty): ${problems.join('; ')}\n`);

    return;
  }

  fail(`${problems.join('; ')}\nUse --allow-dirty to publish anyway.`);
};

const assertVersionUnpublished = ({name, version}: PackageInfo): void => {
  let published: string;

  try {
    published = run('npm', ['view', `${name}@${version}`, 'version', '--json']);
  } catch (error) {
    const stderr = String((error as {stderr?: string}).stderr ?? '');

    if (stderr.includes('E404')) {
      return;
    }

    return fail(`failed to check registry for ${name}@${version}:\n${stderr}`);
  }

  // `npm view` prints nothing (exit 0) when the package exists but the version does not.
  if (published !== '') {
    fail(`${name}@${version} is already published. Bump the version in src/lib/package.json.`);
  }
};

const build = (expected: PackageInfo): void => {
  runInherit('yarn', ['run', 'build:to-publish']);

  const built = readPackageInfo(DIST_PACKAGE_JSON);

  if (built.name !== expected.name || built.version !== expected.version) {
    fail(
      `dist package (${built.name}@${built.version}) does not match source (${expected.name}@${expected.version}).`,
    );
  }
};

const main = async (): Promise<void> => {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 [--dry-run] [--allow-dirty]')
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description: 'Build and run "npm publish --dry-run" without publishing',
    })
    .option('allow-dirty', {
      type: 'boolean',
      default: false,
      description: 'Allow publishing from a non-master branch or a dirty working tree',
    })
    .version(false)
    .strict()
    .help()
    .parseAsync();

  const pkg = readPackageInfo(SRC_PACKAGE_JSON);

  assertGitState(argv.allowDirty);
  assertVersionUnpublished(pkg);
  build(pkg);

  const publishArgs = argv.dryRun ? ['publish', DIST_DIR, '--dry-run'] : ['publish', DIST_DIR];

  runInherit('npm', publishArgs);

  if (!argv.dryRun) {
    process.stdout.write(
      `\nPublished ${pkg.name}@${pkg.version}. Tag the release:\n`
        + `  git tag v${pkg.version} && git push origin v${pkg.version}\n`,
    );
  }
};

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
