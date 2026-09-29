#!/usr/bin/env node

/**
 * Merges per-showcase localization files into the monolithic JSON files
 * that ngx-translate loads at runtime.
 *
 * Follows ndw3 two-tier pattern:
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
 * For the dev language (en): merge all dev files.
 * For translated languages: deep-merge dev files + translated files
 * (translated keys win). This ensures every locale file is complete.
 */

import {readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {join, resolve} from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT_DIR = join(ROOT, 'src/playground/assets/i18n');

const DEV_LANG = 'en';

const SCAN_ROOTS = [
  join(ROOT, 'src/playground/localization'),
  join(ROOT, 'src/playground/app/lib-component-showcase'),
  join(ROOT, 'src/playground/app/lib-widget-showcase'),
  join(ROOT, 'src/playground/app/lib-example-showcase'),
];

function findLocalizationDirs(base) {
  if (!existsSync(base)) return [];
  const dirs = [];
  walkForLocalization(base, dirs);
  return dirs.sort();
}

function walkForLocalization(dir, acc) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const full = join(dir, entry.name);
    if (entry.name === 'localization') {
      acc.push(full);
    } else {
      walkForLocalization(full, acc);
    }
  }
}

function collectDevFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (f.endsWith('.json')) files.push(join(dir, f));
    }
  }
  return files.sort();
}

function collectLangFiles(dirs, lang) {
  const files = [];
  for (const dir of dirs) {
    const langDir = join(dir, lang);
    if (!existsSync(langDir)) continue;
    for (const f of readdirSync(langDir)) {
      if (f.endsWith('.json')) files.push(join(langDir, f));
    }
  }
  return files.sort();
}

function collectTranslatedLangs(dirs) {
  const langs = new Set();
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      if (entry.isDirectory() && entry.name !== '.' && entry.name !== '..') {
        const langDir = join(dir, entry.name);
        const hasJson = readdirSync(langDir).some(f => f.endsWith('.json'));
        if (hasJson) langs.add(entry.name);
      }
    }
  }
  return [...langs].sort();
}

function mergeFiles(files) {
  const merged = {};
  for (const file of files) {
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    for (const [key, value] of Object.entries(data)) {
      if (key in merged) {
        console.warn(`  WARN: duplicate key "${key}" in ${file}, overwriting`);
      }
      merged[key] = value;
    }
  }
  return merged;
}

function deepMerge(base, overlay) {
  const result = {...base};
  for (const [key, value] of Object.entries(overlay)) {
    if (
      typeof value === 'object' && value !== null && !Array.isArray(value) &&
      typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// --- Main ---

// src/playground/localization is itself a localization dir (not nested)
const locDirs = [
  join(ROOT, 'src/playground/localization'),
  ...findLocalizationDirs(join(ROOT, 'src/playground/app/lib-component-showcase')),
  ...findLocalizationDirs(join(ROOT, 'src/playground/app/lib-widget-showcase')),
  ...findLocalizationDirs(join(ROOT, 'src/playground/app/lib-example-showcase')),
];

const devFiles = collectDevFiles(locDirs);
const devMerged = mergeFiles(devFiles);

mkdirSync(OUT_DIR, {recursive: true});

// Dev language (en) — just the dev files
const enOut = join(OUT_DIR, `${DEV_LANG}.json`);
writeFileSync(enOut, JSON.stringify(devMerged, null, 2) + '\n', 'utf-8');
console.log(`${DEV_LANG}.json — ${Object.keys(devMerged).length} top-level keys`);

// Translated languages — dev-English base + translated overlay
const translatedLangs = collectTranslatedLangs(locDirs);
for (const lang of translatedLangs) {
  const langFiles = collectLangFiles(locDirs, lang);
  const langMerged = mergeFiles(langFiles);
  const combined = deepMerge(devMerged, langMerged);
  const outFile = join(OUT_DIR, `${lang}.json`);
  writeFileSync(outFile, JSON.stringify(combined, null, 2) + '\n', 'utf-8');
  console.log(`${lang}.json — ${Object.keys(combined).length} top-level keys (${Object.keys(langMerged).length} translated, rest from dev)`);
}

console.log('Done.');
