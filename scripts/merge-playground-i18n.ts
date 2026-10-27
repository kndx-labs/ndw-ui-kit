#!/usr/bin/env tsx

/**
 * Merges per-showcase localization files into the monolithic JSON files
 * that ngx-translate loads at runtime.
 *
 * Follows two-tier pattern:
 *   localization/*.json           — dev-English (source strings, fallback)
 *   localization/<lang>/*.json    — translated strings (override dev)
 *
 * Sources scanned (each may contain localization/ dirs):
 *   src/playground/localization/              — shared & orphaned keys
 *   src/playground/app/lib-component-showcase/ ** /localization/
 *   src/playground/app/lib-widget-showcase/ ** /localization/
 *   src/playground/app/lib-example-showcase/ ** /localization/
 *
 * Output:
 *   src/playground/assets/i18n/{lang}.json
 *
 * For the dev-English: merge all dev files.
 * For translated languages: deep-merge dev files + translated files
 * (translated keys win). This ensures every locale file is complete.
 */

import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {SRC_DIR} from './conf';

type TranslationTree = Record<string, unknown>;

const PLAYGROUND_DIR = join(SRC_DIR, 'playground');
const OUT_DIR = join(PLAYGROUND_DIR, 'assets/i18n');

const DEV_LANG = 'en';

const isJsonFile = (filename: string): boolean => {
  return filename.endsWith('.json');
};

const isPlainObject = (value: unknown): value is TranslationTree => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const walkForLocalization = (dir: string, acc: string[]): void => {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    if (!entry.isDirectory()) {
      continue;
    }

    const full = join(dir, entry.name);

    if (entry.name === 'localization') {
      acc.push(full);
    } else {
      walkForLocalization(full, acc);
    }
  }
};

const findLocalizationDirs = (base: string): string[] => {
  if (!existsSync(base)) {
    return [];
  }

  const dirs: string[] = [];

  walkForLocalization(base, dirs);

  return dirs.sort();
};

const collectJsonFiles = (dirs: string[]): string[] => {
  const files: string[] = [];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      continue;
    }

    for (const filename of readdirSync(dir)) {
      if (isJsonFile(filename)) {
        files.push(join(dir, filename));
      }
    }
  }

  return files.sort();
};

const collectLangFiles = (dirs: string[], lang: string): string[] => {
  return collectJsonFiles(dirs.map((dir) => join(dir, lang)));
};

const collectTranslatedLangs = (dirs: string[]): string[] => {
  const langs = new Set<string>();

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      continue;
    }

    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      if (entry.isDirectory() && readdirSync(join(dir, entry.name)).some(isJsonFile)) {
        langs.add(entry.name);
      }
    }
  }

  return [...langs].sort();
};

const mergeFiles = (files: string[]): TranslationTree => {
  const merged: TranslationTree = {};

  for (const file of files) {
    const data = JSON.parse(readFileSync(file, 'utf-8')) as TranslationTree;

    for (const [key, value] of Object.entries(data)) {
      if (key in merged) {
        console.warn(`  WARN: duplicate key "${key}" in ${file}, overwriting`);
      }

      merged[key] = value;
    }
  }

  return merged;
};

const deepMerge = (base: TranslationTree, overlay: TranslationTree): TranslationTree => {
  const result: TranslationTree = {...base};

  for (const [key, value] of Object.entries(overlay)) {
    const baseValue = result[key];

    result[key] = isPlainObject(value) && isPlainObject(baseValue)
      ? deepMerge(baseValue, value)
      : value;
  }

  return result;
};

const writeJson = (filePath: string, data: TranslationTree): void => {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
};

const main = (): void => {
  // src/playground/localization is itself a localization dir (not nested)
  const locDirs = [
    join(PLAYGROUND_DIR, 'localization'),
    ...findLocalizationDirs(join(PLAYGROUND_DIR, 'app/lib-component-showcase')),
    ...findLocalizationDirs(join(PLAYGROUND_DIR, 'app/lib-widget-showcase')),
    ...findLocalizationDirs(join(PLAYGROUND_DIR, 'app/lib-example-showcase')),
  ];

  const devMerged = mergeFiles(collectJsonFiles(locDirs));

  mkdirSync(OUT_DIR, {recursive: true});

  // Dev language (en) — just the dev files
  writeJson(join(OUT_DIR, `${DEV_LANG}.json`), devMerged);
  console.log(`${DEV_LANG}.json — ${Object.keys(devMerged).length} top-level keys`);

  // Translated languages — dev-English base + translated overlay
  for (const lang of collectTranslatedLangs(locDirs)) {
    const langMerged = mergeFiles(collectLangFiles(locDirs, lang));
    const combined = deepMerge(devMerged, langMerged);
    const translatedCount = Object.keys(langMerged).length;

    writeJson(join(OUT_DIR, `${lang}.json`), combined);
    console.log(
      `${lang}.json — ${Object.keys(combined).length} top-level keys (${translatedCount} translated, rest from dev)`,
    );
  }

  console.log('Done.');
};

main();
