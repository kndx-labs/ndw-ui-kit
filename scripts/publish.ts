#!/usr/bin/env tsx

import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import * as semver from 'semver';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {DIST_CHARTS_DIR, DIST_DIR, DIST_TEMP_DIR, PACKAGE_SCOPE, ROOT_DIR, SRC_CHARTS_PACKAGE_JSON} from './conf';

const SRC_CORE_PACKAGE_JSON = resolve(ROOT_DIR, 'src/lib/package.json');
const DIST_CORE_PACKAGE_JSON = resolve(DIST_DIR, 'package.json');
const DIST_CHARTS_PACKAGE_JSON = resolve(DIST_CHARTS_DIR, 'package.json');
const RELEASE_BRANCH = 'master';
const SEMVER_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const PACKAGE_ORDER = ['core', 'charts'] as const;

type PackageKey = (typeof PACKAGE_ORDER)[number];

interface PackageInfo {
  key: PackageKey;
  name: string;
  version: string;
  sourcePath: string;
  distPath: string;
  tag: string;
}

interface PackageManifest {
  name: string;
  version: string;
  peerDependencies?: Record<string, unknown>;
}

const fail = (message: string): never => {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
};

const run = (file: string, args: string[]): string => {
  return execFileSync(file, args, {cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
};

const runNpm = (args: string[]): string => {
  return execFileSync('npm', args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
};

const runInherit = (file: string, args: string[]): void => {
  execFileSync(file, args, {cwd: ROOT_DIR, env: process.env, stdio: 'inherit'});
};

const readManifest = (path: string): PackageManifest => {
  return JSON.parse(readFileSync(path, 'utf8')) as PackageManifest;
};

const readPackageInfo = (key: PackageKey, sourcePath: string, distPath: string): PackageInfo => {
  const {name, version} = readManifest(sourcePath);

  const expectedName = `${PACKAGE_SCOPE}/${key}`;

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

const isPublished = ({name, version}: PackageInfo): boolean => {
  let published: string;

  try {
    published = runNpm(['view', `${name}@${version}`, 'version', '--json']);
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

  if (typeof peerRangeValue !== 'string') {
    return fail(
      `${packages.charts.name}: invalid ${packages.core.name} peer range ${JSON.stringify(peerRangeValue)}.`,
    );
  }

  if (semver.validRange(peerRangeValue) === null) {
    return fail(
      `${packages.charts.name}: invalid ${packages.core.name} peer range ${JSON.stringify(peerRangeValue)}.`,
    );
  }

  const peerRange = peerRangeValue;

  if (semver.satisfies(packages.core.version, peerRange)) {
    return peerRange;
  }

  const message = `charts peer range ${peerRange} excludes core ${packages.core.version}; charts needs a release`;

  if (selected.some(({key}) => key === 'charts')) {
    fail(`${message}.`);
  }

  process.stderr.write(`Warning: ${message}.\n`);

  return peerRange;
};

const assertUnpublished = (packages: Record<PackageKey, PackageInfo>, selected: PackageInfo[]): void => {
  const includesCore = selected.some(({key}) => key === 'core');
  const includesCharts = selected.some(({key}) => key === 'charts');

  if (includesCharts && !includesCore && !isPublished(packages.core)) {
    fail(
      `${packages.core.name}@${packages.core.version} is not published; publish it first or select both packages.`,
    );
  }

  for (const pkg of selected) {
    if (isPublished(pkg)) {
      fail(`${pkg.name}@${pkg.version} is already published.`);
    }
  }
};

const assertDistMatchesSource = (pkg: PackageInfo): void => {
  const dist = readManifest(pkg.distPath);

  if (dist.name !== pkg.name || dist.version !== pkg.version) {
    fail(
      `dist package (${dist.name}@${dist.version}) does not match source (${pkg.name}@${pkg.version}).`,
    );
  }
};

const build = (selected: PackageInfo[]): void => {
  runInherit('yarn', ['run', 'build:to-publish']);

  for (const pkg of selected) {
    assertDistMatchesSource(pkg);
  }
};

const smokeChartsWithRegistryCore = (core: PackageInfo): void => {
  mkdirSync(DIST_TEMP_DIR, {recursive: true});

  const tempDir = mkdtempSync(resolve(DIST_TEMP_DIR, 'publish-core-'));

  try {
    let packed: string;

    try {
      packed = runNpm(['pack', `${core.name}@${core.version}`, '--json', '--pack-destination', tempDir]);
    } catch (error) {
      const stderr = String((error as {stderr?: string}).stderr ?? '');

      return fail(`failed to pack registry package ${core.name}@${core.version}:\n${stderr}`);
    }

    let tarballName: unknown;

    try {
      const packResult = JSON.parse(packed) as Array<{filename?: unknown}>;

      tarballName = packResult[0]?.filename;
    } catch {
      return fail(`npm pack returned invalid JSON for ${core.name}@${core.version}.`);
    }

    if (typeof tarballName !== 'string') {
      return fail(`npm pack did not return a tarball filename for ${core.name}@${core.version}.`);
    }

    const tarballPath = resolve(tempDir, tarballName);

    runInherit('yarn', ['run', 'smoke:consumer', '--core-tarball', tarballPath]);
  } finally {
    rmSync(tempDir, {recursive: true, force: true});
  }
};

const parseRequestedPackages = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const packages: unknown[] = value;

  return packages.map((name) => String(name));
};

const main = async (): Promise<void> => {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 <core|charts>... [--dry-run] [--allow-dirty]')
    .command('$0 [packages..]', 'Publish selected packages', (command) => {
      return command.positional('packages', {
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

  const requested = parseRequestedPackages(argv.packages);

  if (requested.length === 0) {
    fail('select one or more packages: core, charts.');
  }

  const invalid = requested.filter((name) => !PACKAGE_ORDER.includes(name as PackageKey));

  if (invalid.length > 0) {
    fail(`unknown package(s) ${invalid.join(', ')}; select from: core, charts.`);
  }

  const requestedSet = new Set(requested as PackageKey[]);
  const selected = PACKAGE_ORDER.filter((key) => requestedSet.has(key));
  const packages = readPackages();
  const selectedPackages = selected.map((key) => packages[key]);

  assertGitState(argv.allowDirty);
  assertPeerCompatibility(packages, selectedPackages);
  assertUnpublished(packages, selectedPackages);
  build(selectedPackages);

  const includesCore = selected.includes('core');
  const includesCharts = selected.includes('charts');

  if (includesCharts && !includesCore) {
    smokeChartsWithRegistryCore(packages.core);
  }

  for (const pkg of selectedPackages) {
    const publishPath = dirname(pkg.distPath);
    const publishArgs = argv['dry-run'] ? ['publish', publishPath, '--dry-run'] : ['publish', publishPath];

    runInherit('npm', publishArgs);

    const result = argv['dry-run'] ? 'Dry run passed' : 'Published';

    process.stdout.write(`${result}: ${pkg.name}@${pkg.version}. Tag: ${pkg.tag}\n`);
  }
};

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
