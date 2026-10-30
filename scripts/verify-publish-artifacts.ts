#!/usr/bin/env tsx

import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import semver from 'semver';
import type * as Sass from 'sass';
import {
  CHARTS_PACKAGE_NAME,
  CORE_PACKAGE_NAME,
  DIST_CHARTS_DIR,
  DIST_CUSTOM_SPRITE_CLI_FILE,
  DIST_DIR,
  DIST_SPRITE_ICONS_DIR,
  ROOT_DIR,
  SRC_CHARTS_PACKAGE_JSON,
} from './conf';

const {compile} = createRequire(require.resolve('@angular/build'))('sass') as typeof Sass;

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

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const listFiles = (dir: string): string[] => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      return listFiles(path);
    }

    return [path];
  });
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

const collectCoreImports = (files: string[]): Set<string> => {
  const coreImports = new Set<string>();
  const importPattern = new RegExp(
    `(?:\\bfrom\\s*|\\bimport\\s*(?:\\(\\s*)?)(['"])(${escapeRegExp(CORE_PACKAGE_NAME)}(?:/[^'"]*)?)\\1`,
    'g',
  );

  for (const file of files) {
    if (!file.endsWith('.ts') || file.endsWith('.spec.ts')) {
      continue;
    }

    const source = readFileSync(file, 'utf8');

    for (const match of source.matchAll(importPattern)) {
      coreImports.add(match[2]);
    }
  }

  return coreImports;
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

  const sourceFiles = listFiles(join(ROOT_DIR, 'src/charts')).filter((file) => file.endsWith('.ts'));
  const coreImports = collectCoreImports(sourceFiles);

  if (coreImports.size === 0) {
    fail(packageName, `charts sources do not import anything from ${CORE_PACKAGE_NAME}`);
  }

  const bundleFile = join(DIST_CHARTS_DIR, 'fesm2022/ndw-ui-kit-charts.mjs');

  if (!existsSync(bundleFile)) {
    fail(packageName, `missing FESM bundle: ${bundleFile}`);
  }

  const bundle = readFileSync(bundleFile, 'utf8');

  for (const specifier of coreImports) {
    const importPattern = new RegExp(`\\bfrom\\s*(['"])${escapeRegExp(specifier)}\\1`);

    if (!importPattern.test(bundle)) {
      fail(
        packageName,
        `core import ${specifier} is missing from ${relative(ROOT_DIR, bundleFile)}; core may be bundled`,
      );
    }
  }

  verifyChartsSass(DIST_CHARTS_DIR);
};

const svgFileCount = verifyCore();

verifyCharts();

const verifiedPackages = [CORE_PACKAGE_NAME, CHARTS_PACKAGE_NAME].join(' and ');

process.stdout.write(
  `OK: publish artifacts are present for ${verifiedPackages} (${svgFileCount} sprite source SVGs).\n`,
);
