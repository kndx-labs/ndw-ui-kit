#!/usr/bin/env tsx

import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import * as semver from 'semver';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {
  CHARTS_PACKAGE_NAME,
  CORE_PACKAGE_NAME,
  DIST_CHARTS_DIR,
  DIST_DIR,
  DIST_TEMP_DIR,
  PACKAGE_ORDER,
  type PackageKey,
  ROOT_DIR,
  SRC_CHARTS_PACKAGE_JSON,
  SRC_CORE_PACKAGE_JSON,
} from './conf';
import {type PackageInfo, type ReleaseCommands, runRelease} from './utils/release-pipeline';

const DIST_CORE_PACKAGE_JSON = resolve(DIST_DIR, 'package.json');
const DIST_CHARTS_PACKAGE_JSON = resolve(DIST_CHARTS_DIR, 'package.json');
const RELEASE_BRANCH = 'master';
const SEMVER_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const PACKAGE_NAMES: Record<PackageKey, string> = {
  core: CORE_PACKAGE_NAME,
  charts: CHARTS_PACKAGE_NAME,
};

interface PackageManifest {
  name: string;
  version: string;
  peerDependencies?: Record<string, unknown>;
}

const fail = (message: string): never => {
  throw new Error(message);
};

const run = (file: string, args: string[]): string => {
  return execFileSync(file, args, {cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
};

const runInherit = (file: string, args: string[]): void => {
  execFileSync(file, args, {cwd: ROOT_DIR, env: process.env, stdio: 'inherit'});
};

const readManifest = (path: string): PackageManifest => {
  return JSON.parse(readFileSync(path, 'utf8')) as PackageManifest;
};

const readPackageInfo = (key: PackageKey, sourcePath: string, distPath: string): PackageInfo => {
  const {name, version} = readManifest(sourcePath);

  const expectedName = PACKAGE_NAMES[key];

  if (typeof name !== 'string' || name !== expectedName) {
    fail(`${sourcePath}: expected package name "${expectedName}", got ${JSON.stringify(name)}.`);
  }

  if (typeof version !== 'string' || !SEMVER_RE.test(version)) {
    fail(`${sourcePath}: invalid version ${JSON.stringify(version)}.`);
  }

  const tag = key === 'core' ? `v${version}` : `charts-v${version}`;

  return {key, name, version, sourcePath, distPath, tag};
};

const readPackages = (): Record<PackageKey, PackageInfo> => {
  return {
    core: readPackageInfo('core', SRC_CORE_PACKAGE_JSON, DIST_CORE_PACKAGE_JSON),
    charts: readPackageInfo('charts', SRC_CHARTS_PACKAGE_JSON, DIST_CHARTS_PACKAGE_JSON),
  };
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

const isPublished = (name: string, version: string): boolean => {
  let published: string;

  try {
    published = run('npm', ['view', `${name}@${version}`, 'version', '--json']);
  } catch (error) {
    const stderr = String((error as {stderr?: string}).stderr ?? '');

    if (stderr.includes('E404')) {
      return false;
    }

    return fail(`failed to check registry for ${name}@${version}:\n${stderr}`);
  }

  return published !== '';
};

const assertPeerCompatibility = (packages: Record<PackageKey, PackageInfo>, selected: PackageInfo[]): string => {
  const chartsManifest = readManifest(packages.charts.sourcePath);
  const peerRangeValue = chartsManifest.peerDependencies?.[packages.core.name];

  if (typeof peerRangeValue !== 'string' || semver.validRange(peerRangeValue) === null) {
    return fail(
      `${packages.charts.name}: invalid ${packages.core.name} peer range ${JSON.stringify(peerRangeValue)}.`,
    );
  }

  if (semver.satisfies(packages.core.version, peerRangeValue)) {
    return peerRangeValue;
  }

  const message = `charts peer range ${peerRangeValue} excludes core ${packages.core.version}; charts needs a release`;

  if (selected.some(({key}) => key === 'charts')) {
    fail(`${message}.`);
  }

  process.stderr.write(`Warning: ${message}.\n`);

  return peerRangeValue;
};

const assertDistMatchesSource = (pkg: PackageInfo): void => {
  const dist = readManifest(pkg.distPath);

  if (dist.name !== pkg.name || dist.version !== pkg.version) {
    fail(
      `dist package (${dist.name}@${dist.version}) does not match source (${pkg.name}@${pkg.version}).`,
    );
  }
};

const createReleaseCommands = (): ReleaseCommands => {
  return {
    yarn(args) {
      runInherit('yarn', ['run', ...args]);
    },
    isPublished,
    packRegistry(name, version, destination) {
      let packed: string;

      try {
        packed = run('npm', ['pack', `${name}@${version}`, '--json', '--pack-destination', destination]);
      } catch (error) {
        const stderr = String((error as {stderr?: string}).stderr ?? '');

        return fail(`failed to pack registry package ${name}@${version}:\n${stderr}`);
      }

      let tarballName: unknown;

      try {
        const packResult = JSON.parse(packed) as Array<{filename?: unknown}>;

        tarballName = packResult[0]?.filename;
      } catch {
        return fail(`npm pack returned invalid JSON for ${name}@${version}.`);
      }

      if (typeof tarballName !== 'string') {
        return fail(`npm pack did not return a tarball filename for ${name}@${version}.`);
      }

      return resolve(destination, tarballName);
    },
    extractCore(tarball) {
      rmSync(DIST_DIR, {recursive: true, force: true});
      mkdirSync(DIST_DIR, {recursive: true});
      runInherit('tar', ['-xzf', tarball, '-C', DIST_DIR, '--strip-components=1']);
    },
    assertDistMatchesSource,
    npmPublish(pkg, dryRun) {
      const publishPath = dirname(pkg.distPath);
      const publishArgs = dryRun ? ['publish', publishPath, '--dry-run'] : ['publish', publishPath];

      runInherit('npm', publishArgs);
    },
    makeTempDir() {
      mkdirSync(DIST_TEMP_DIR, {recursive: true});

      return mkdtempSync(resolve(DIST_TEMP_DIR, 'publish-core-'));
    },
    removeDir(path) {
      rmSync(path, {recursive: true, force: true});
    },
    log(line) {
      process.stdout.write(`${line}\n`);
    },
  };
};

const main = async (): Promise<void> => {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 [core] [charts] [--dry-run] [--allow-dirty]')
    .command('$0 [packages..]', 'Publish selected packages', (command) => {
      return command.positional('packages', {
        array: true,
        choices: PACKAGE_ORDER,
        describe: 'Packages to publish',
        type: 'string',
      });
    })
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

  // The command builder's positional type does not reach parseAsync(); yargs validates `choices` at runtime
  const requested: PackageKey[] = Array.isArray(argv.packages) ? argv.packages : [];

  if (requested.length === 0) {
    fail('select one or more packages: core, charts.');
  }

  const requestedSet = new Set(requested);
  const selected = PACKAGE_ORDER.filter((key) => requestedSet.has(key));
  const packages = readPackages();
  const selectedPackages = selected.map((key) => packages[key]);

  assertGitState(argv.allowDirty);

  const peerRange = assertPeerCompatibility(packages, selectedPackages);

  runRelease(selected, packages, peerRange, argv['dry-run'], createReleaseCommands());
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
});
