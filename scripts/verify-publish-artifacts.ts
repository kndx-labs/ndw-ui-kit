#!/usr/bin/env tsx

import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {globSync} from 'fast-glob';
import * as semver from 'semver';
import type * as Sass from 'sass';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {
  CHARTS_PACKAGE_NAME,
  CORE_PACKAGE_NAME,
  DIST_CHARTS_DIR,
  DIST_CUSTOM_SPRITE_CLI_FILE,
  DIST_DIR,
  DIST_SPRITE_ICONS_DIR,
  PACKAGE_ORDER,
  type PackageKey,
  SRC_CHARTS_PACKAGE_JSON,
} from './conf';

const {compile} = createRequire(require.resolve('@angular/build'))('sass') as typeof Sass;
const PACKAGE_NAMES: Record<PackageKey, string> = {
  core: CORE_PACKAGE_NAME,
  charts: CHARTS_PACKAGE_NAME,
};

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports?: Record<string, {types?: string} | unknown>;
}

const fail = (packageName: string, message: string): never => {
  process.stderr.write(`Error: ${packageName}: ${message}\n`);
  process.exit(1);
};

const readPackageJson = (packageName: string, path: string): PackageJson => {
  if (!existsSync(path)) {
    fail(packageName, `missing package.json: ${path}`);
  }

  try {
    return JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
  } catch (error) {
    return fail(packageName, `could not read ${path}: ${String(error)}`);
  }
};

const listFiles = (dir: string): string[] => {
  if (!existsSync(dir)) {
    return [];
  }

  return globSync(
    '**/*',
    {
      absolute: true,
      cwd: dir,
      dot: true,
      onlyFiles: true,
    },
  );
};

const verifyCommon = (packageName: string, distDir: string): PackageJson => {
  if (!existsSync(distDir)) {
    fail(packageName, `dist directory not found: ${distDir}. Run "yarn build:to-publish" first.`);
  }

  const manifest = readPackageJson(packageName, join(distDir, 'package.json'));

  for (const fileName of ['README.md', 'CHANGELOG.md', 'LICENSE.txt']) {
    if (!existsSync(join(distDir, fileName))) {
      fail(packageName, `missing ${fileName}`);
    }
  }

  const entryTypes = manifest.exports?.['.'] && typeof manifest.exports['.'] === 'object'
    ? (manifest.exports['.'] as {types?: string}).types
    : undefined;

  if (typeof entryTypes !== 'string' || !existsSync(join(distDir, entryTypes))) {
    fail(packageName, `exports["."].types does not point to an existing file`);
  }

  if (!manifest.exports?.['./styles/*']) {
    fail(packageName, 'exports["./styles/*"] is missing');
  }

  return manifest;
};

const verifyCore = (): number => {
  const packageName = CORE_PACKAGE_NAME;
  const manifest = verifyCommon(packageName, DIST_DIR);

  if (manifest.name !== packageName) {
    fail(packageName, `dist manifest name is ${JSON.stringify(manifest.name)}`);
  }

  if (!existsSync(DIST_CUSTOM_SPRITE_CLI_FILE)) {
    fail(packageName, `missing CLI artifact: ${DIST_CUSTOM_SPRITE_CLI_FILE}. Run "yarn run emit-custom-sprite-cli".`);
  }

  if (!existsSync(DIST_SPRITE_ICONS_DIR)) {
    fail(
      packageName,
      `missing icon source directory: ${DIST_SPRITE_ICONS_DIR}. Run "yarn run copy-custom-sprite-sources".`,
    );
  }

  const svgFileCount = readdirSync(DIST_SPRITE_ICONS_DIR).filter((file) => file.endsWith('.svg')).length;

  if (svgFileCount === 0) {
    fail(packageName, `no SVG files found in ${DIST_SPRITE_ICONS_DIR}`);
  }

  const themesFile = join(DIST_DIR, 'styles/themes.scss');

  try {
    compile(themesFile);
  } catch (error: unknown) {
    fail(packageName, `${themesFile} does not compile without load paths: ${String(error)}`);
  }

  return svgFileCount;
};

const verifyChartsSass = (chartsDistDir: string): void => {
  const packageName = CHARTS_PACKAGE_NAME;
  const scssFiles = listFiles(chartsDistDir).filter((file) => file.endsWith('.scss'));
  const importPattern = /@(use|forward|import)\s+(?:url\()?\s*(['"])([^'"]+)\2/g;

  if (!existsSync(join(chartsDistDir, 'styles/themes.scss'))) {
    fail(packageName, 'missing styles/themes.scss');
  }

  for (const file of scssFiles) {
    const source = readFileSync(file, 'utf8');

    for (const match of source.matchAll(importPattern)) {
      const specifier = match[3];

      if (specifier.startsWith(CORE_PACKAGE_NAME) && !specifier.startsWith(`${CORE_PACKAGE_NAME}/`)) {
        fail(packageName, `${relative(chartsDistDir, file)} imports core using non-public specifier ${specifier}`);
      }

      if (specifier.startsWith('styles/')) {
        fail(packageName, `${relative(chartsDistDir, file)} uses root-relative core Sass import ${specifier}`);
      }

      if (specifier.startsWith('.')) {
        const importedPath = resolve(dirname(file), specifier);
        const fromPackage = relative(chartsDistDir, importedPath);

        if (isAbsolute(fromPackage) || fromPackage === '..' || fromPackage.startsWith(`..${sep}`)) {
          fail(packageName, `${relative(chartsDistDir, file)} imports outside package: ${specifier}`);
        }
      }
    }
  }
};

const verifyCharts = (): void => {
  const packageName = CHARTS_PACKAGE_NAME;
  const sourceManifest = readPackageJson(packageName, SRC_CHARTS_PACKAGE_JSON);
  const distManifest = verifyCommon(packageName, DIST_CHARTS_DIR);

  if (distManifest.name !== sourceManifest.name || distManifest.version !== sourceManifest.version) {
    fail(
      packageName,
      `dist manifest (${distManifest.name}@${distManifest.version}) does not match source (${sourceManifest.name}@${sourceManifest.version})`,
    );
  }

  const sourcePeer = sourceManifest.peerDependencies?.[CORE_PACKAGE_NAME];
  const distPeer = distManifest.peerDependencies?.[CORE_PACKAGE_NAME];

  if (distPeer !== sourcePeer) {
    fail(
      packageName,
      `dist peer range ${JSON.stringify(distPeer)} does not match source ${JSON.stringify(sourcePeer)}`,
    );
  }

  if (typeof sourcePeer !== 'string' || !semver.validRange(sourcePeer) || !sourcePeer.trim().startsWith('^')) {
    fail(packageName, `invalid ${CORE_PACKAGE_NAME} peer range ${JSON.stringify(sourcePeer)}; expected a caret range`);
  }

  if (distManifest.dependencies?.[CORE_PACKAGE_NAME]) {
    fail(packageName, `${CORE_PACKAGE_NAME} must be a peerDependency, not a dependency`);
  }

  verifyChartsSass(DIST_CHARTS_DIR);
};

const argv = yargs(hideBin(process.argv))
  .option('packages', {
    array: true,
    choices: PACKAGE_ORDER,
    default: [...PACKAGE_ORDER],
    describe: 'Packages whose publish artifacts to verify.',
    type: 'string',
  })
  .strict()
  .parseSync();

const requestedPackages = new Set(argv.packages);
const selectedPackages = PACKAGE_ORDER.filter((key) => {
  return requestedPackages.has(key);
});

let svgFileCount: number | undefined;

for (const packageKey of selectedPackages) {
  if (packageKey === 'core') {
    svgFileCount = verifyCore();
  } else {
    verifyCharts();
  }
}

const verifiedPackages = selectedPackages.map((key) => {
  return PACKAGE_NAMES[key];
}).join(' and ');
let summary = `OK: publish artifacts are present for ${verifiedPackages}`;

if (svgFileCount !== undefined) {
  summary += ` (${svgFileCount} sprite source SVGs)`;
}

process.stdout.write(`${summary}.\n`);
