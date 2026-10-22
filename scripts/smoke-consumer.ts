#!/usr/bin/env tsx

import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {join, resolve, sep} from 'node:path';
import {
  CHARTS_PACKAGE_NAME,
  CORE_PACKAGE_NAME,
  DIST_CHARTS_DIR,
  DIST_DIR,
  DIST_TEMP_DIR,
  PACKAGE_SCOPE,
  ROOT_DIR,
} from './conf';

const FIXTURE_DIR = join(ROOT_DIR, 'scripts/data/smoke-consumer');
const NODE_MODULES_DIR = join(ROOT_DIR, 'node_modules');
const CHARTS_TOKEN = '--ndwu-heat-strip-level-0-bg';
const CORE_TOKEN = '--ndwu-color-gray-70';

const fail = (message: string): never => {
  throw new Error(message);
};

const parseArgs = (args: string[]): string | undefined => {
  let coreTarball: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg !== '--core-tarball' || coreTarball !== undefined || index + 1 >= args.length) {
      fail('Usage: smoke-consumer [--core-tarball <path>]');
    }

    coreTarball = resolve(args[index + 1]);
    index += 1;
  }

  return coreTarball;
};

const createDependencyLinks = (consumerNodeModules: string): void => {
  for (const entryName of readdirSync(NODE_MODULES_DIR)) {
    if (entryName === '.bin' || entryName === PACKAGE_SCOPE) {
      continue;
    }

    const source = join(NODE_MODULES_DIR, entryName);
    const sourceStat = statSync(source);
    const target = join(consumerNodeModules, entryName);

    if (entryName.startsWith('@') && sourceStat.isDirectory()) {
      mkdirSync(target, {recursive: true});

      for (const scopedName of readdirSync(source)) {
        const scopedSource = join(source, scopedName);
        const scopedTarget = join(target, scopedName);
        const scopedStat = statSync(scopedSource);

        symlinkSync(scopedSource, scopedTarget, scopedStat.isDirectory() ? 'dir' : 'file');
      }

      continue;
    }

    symlinkSync(source, target, sourceStat.isDirectory() ? 'dir' : 'file');
  }
};

const packLocalPackage = (packageDir: string, destination: string): string => {
  mkdirSync(destination, {recursive: true});
  execFileSync('npm', ['pack', packageDir, '--pack-destination', destination, '--quiet'], {
    cwd: ROOT_DIR,
    env: {...process.env, npm_config_cache: join(destination, '.npm-cache')},
    stdio: 'inherit',
  });

  const tarballs = readdirSync(destination).filter((file) => file.endsWith('.tgz'));

  if (tarballs.length === 0) {
    fail(`npm pack did not create a tarball for ${packageDir}`);
  }

  return join(destination, tarballs[tarballs.length - 1]);
};

const extractPackage = (tarball: string, packageDir: string): void => {
  mkdirSync(packageDir, {recursive: true});
  execFileSync('tar', ['-xzf', tarball, '-C', packageDir, '--strip-components=1'], {stdio: 'inherit'});
};

const listCssFiles = (dir: string): string[] => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      return listCssFiles(path);
    }

    return entry.name.endsWith('.css') ? [path] : [];
  });
};

const assertThemeDeclarations = (consumerDir: string): void => {
  const cssFiles = listCssFiles(join(consumerDir, 'dist'));
  const browserCssFiles = cssFiles.filter((file) =>
    file.includes(`${sep}browser${sep}`) && /styles-[^/]+\.css$/.test(file)
  );

  if (browserCssFiles.length === 0) {
    fail('production build did not emit dist/**/browser/styles-*.css');
  }

  const css = browserCssFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
  const selectors = [':root', '.ndwu-theme-light', '.ndwu-theme-dark'];

  for (const selector of selectors) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedToken = CHARTS_TOKEN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rulePattern = new RegExp(`${escapedSelector}[^{}]*\\{[^}]*${escapedToken}\\s*:`, 's');

    if (!rulePattern.test(css)) {
      fail(`${CHARTS_TOKEN} is not declared inside ${selector}`);
    }
  }

  if (!css.includes(CORE_TOKEN)) {
    fail(`${CORE_TOKEN} is missing from the core theme CSS`);
  }
};

const buildConsumer = (consumerDir: string, tempSystemDir: string): {status: number | null; output: string} => {
  const result = spawnSync(
    process.execPath,
    [join(NODE_MODULES_DIR, '@angular/cli/bin/ng.js'), 'build', '--configuration', 'production'],
    {
      cwd: consumerDir,
      env: {...process.env, TMPDIR: tempSystemDir},
      encoding: 'utf8',
    },
  );
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error) {
    return {status: result.status, output: `${output}\n${result.error.message}`};
  }

  return {status: result.status, output};
};

const main = (): void => {
  let tempDir: string | undefined;

  try {
    const coreTarball = parseArgs(process.argv.slice(2));

    if (!existsSync(DIST_DIR) || !existsSync(DIST_CHARTS_DIR)) {
      fail('core and charts dist packages must exist; run "yarn build" first');
    }

    mkdirSync(DIST_TEMP_DIR, {recursive: true});
    tempDir = mkdtempSync(join(DIST_TEMP_DIR, 'smoke-consumer-'));
    cpSync(FIXTURE_DIR, tempDir, {recursive: true});

    const chartsTarball = packLocalPackage(DIST_CHARTS_DIR, join(tempDir, 'charts-pack'));
    const packedCoreTarball = coreTarball ?? packLocalPackage(DIST_DIR, join(tempDir, 'core-pack'));
    const tempSystemDir = join(tempDir, 'tmp');
    const consumerNodeModules = join(tempDir, 'node_modules');

    mkdirSync(tempSystemDir);
    mkdirSync(consumerNodeModules);
    createDependencyLinks(consumerNodeModules);

    mkdirSync(join(consumerNodeModules, PACKAGE_SCOPE));
    extractPackage(packedCoreTarball, join(consumerNodeModules, CORE_PACKAGE_NAME));
    extractPackage(chartsTarball, join(consumerNodeModules, CHARTS_PACKAGE_NAME));

    const validBuild = buildConsumer(tempDir, tempSystemDir);

    if (validBuild.status !== 0) {
      fail(`consumer production build failed with exit code ${String(validBuild.status)}`);
    }

    assertThemeDeclarations(tempDir);

    const appComponentPath = join(tempDir, 'src/app.component.ts');
    const validAppComponent = readFileSync(appComponentPath, 'utf8');
    const invalidAppComponent = validAppComponent.replace('cell.data?.label', 'cell.data?.missing');

    if (invalidAppComponent === validAppComponent) {
      fail('smoke template did not contain typed cell.data?.label binding');
    }

    writeFileSync(appComponentPath, invalidAppComponent);

    const invalidBuild = buildConsumer(tempDir, tempSystemDir);

    if (invalidBuild.status === 0) {
      fail('strictTemplates did not reject unknown cell.data field');
    }

    if (!invalidBuild.output.includes('Property \'missing\' does not exist')) {
      fail(`strictTemplates failed for an unexpected reason:\n${invalidBuild.output}`);
    }

    process.stdout.write('OK: strictTemplates rejected unknown cell.data field.\n');
    rmSync(tempDir, {recursive: true, force: true});
    process.stdout.write('OK: charts consumer production build and theme assertions passed.\n');
  } catch (error: unknown) {
    process.stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`);

    if (tempDir) {
      process.stderr.write(`Consumer workspace retained at ${tempDir}\n`);
    }

    process.exitCode = 1;
  }
};

main();
