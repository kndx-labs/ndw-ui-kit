import * as semver from 'semver';
import type {PackageKey} from '../conf';

export interface PackageInfo {
  key: PackageKey;
  name: string;
  version: string;
  sourcePath: string;
  distPath: string;
  tag: string;
}

export interface ReleaseCommands {
  yarn(args: string[]): void;
  isPublished(name: string, version: string): boolean;
  packRegistry(name: string, version: string, destination: string): string;
  extractCore(tarball: string): void;
  assertDistMatchesSource(pkg: PackageInfo): void;
  npmPublish(pkg: PackageInfo, dryRun: boolean): void;
  makeTempDir(): string;
  removeDir(path: string): void;
  log(line: string): void;
}

export const peerFloor = (range: string): string => {
  const minimum = semver.minVersion(range);

  if (minimum === null) {
    throw new Error(`invalid charts peer range ${JSON.stringify(range)}.`);
  }

  return minimum.version;
};

const publishSelected = (
  selected: PackageKey[],
  packages: Record<PackageKey, PackageInfo>,
  dryRun: boolean,
  commands: ReleaseCommands,
): void => {
  for (const key of selected) {
    const pkg = packages[key];

    commands.npmPublish(pkg, dryRun);

    if (dryRun) {
      commands.log(`Dry run passed: ${pkg.name}@${pkg.version}`);
    } else {
      commands.log(`Published: ${pkg.name}@${pkg.version}`);
      commands.log(`Tag: git tag ${pkg.tag} && git push origin ${pkg.tag}`);
    }
  }
};

export const runRelease = (
  selected: PackageKey[],
  packages: Record<PackageKey, PackageInfo>,
  peerRange: string,
  dryRun: boolean,
  commands: ReleaseCommands,
): void => {
  if (selected.length === 0) {
    throw new Error('select one or more packages: core, charts.');
  }

  const includesCore = selected.includes('core');
  const includesCharts = selected.includes('charts');
  const floor = includesCharts && !includesCore ? peerFloor(peerRange) : undefined;

  for (const key of selected) {
    const pkg = packages[key];

    if (commands.isPublished(pkg.name, pkg.version)) {
      throw new Error(`${pkg.name}@${pkg.version} is already published.`);
    }
  }

  if (floor !== undefined && !commands.isPublished(packages.core.name, floor)) {
    throw new Error(`${packages.core.name}@${floor} (charts peer floor) is not published.`);
  }

  const tempDir = commands.makeTempDir();

  try {
    if (includesCore) {
      commands.yarn(['build:core']);
      commands.yarn(['emit-custom-sprite-cli']);
      commands.yarn(['copy-custom-sprite-sources']);
    }

    let coreTarball: string | undefined;

    if (floor !== undefined) {
      commands.log(`Using published ${packages.core.name}@${floor} for charts build and smoke.`);
      coreTarball = commands.packRegistry(packages.core.name, floor, tempDir);
      commands.extractCore(coreTarball);
    }

    if (includesCharts) {
      commands.yarn(['build:charts']);
    }

    commands.yarn(['verify:publish-artifacts', '--packages', ...selected]);

    if (includesCharts) {
      const smokeArgs = ['smoke:consumer'];

      if (coreTarball !== undefined) {
        smokeArgs.push('--core-tarball', coreTarball);
      }

      commands.yarn(smokeArgs);
    }

    for (const key of selected) {
      commands.assertDistMatchesSource(packages[key]);
    }

    publishSelected(selected, packages, dryRun, commands);
  } finally {
    commands.removeDir(tempDir);
  }
};
