import {readFile, stat} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {getComponentIdFromEntry} from 'storybook/internal/common';
import {extractDescription, loadCsf} from 'storybook/internal/csf-tools';
import {logger} from 'storybook/internal/node-logger';
import type {IndexEntry, StoryIndexEntry} from 'storybook/internal/types';
import {buildApiDescription} from './api-description.js';
import {CompodocClass, CompodocData, CompodocValues, readCompodoc} from './compodoc.js';
import {readEntryPoints, readPathAliases} from './entry-points.js';
import {HostSelector, hostMarkup, parseSelectors, preferredSelector} from './selector.js';
import {buildSnippet, readPath, storyPackages} from './snippet.js';
import {StaticEvaluator, Unresolvable} from './static-eval.js';
import {TypeSources} from './type-source.js';

interface StoryManifest {
  id: string;
  name: string;
  description?: string;
  snippet?: string;
}

interface ComponentManifest {
  id: string;
  name: string;
  path?: string;
  description?: string;
  summary?: string;
  import?: string;
  jsDocTags?: Record<string, string[]>;
  apiDescription?: string;
  stories?: StoryManifest[];
  error?: {name: string; message: string};
}

interface ComponentsManifest {
  v: 0;
  components: Record<string, ComponentManifest>;
}

interface ManifestsOptions {
  configDir: string;
  configType?: string;
  manifestEntries: IndexEntry[];
}

interface BuildContext {
  rootDir: string;
  data: CompodocData;
  values: CompodocValues;
  evaluator: StaticEvaluator;
  typeSources: TypeSources;
  entryPoints: Map<string, string>;
}

interface BuildResult {
  components: Record<string, ComponentManifest>;
  files: string[];
}

interface Cache {
  ids: string;
  key: string | null;
  files: string[];
  result: Promise<BuildResult>;
}

const DEFAULT_ENTRY_POINT = '@ndw-ui-kit/core';
const MAX_SUMMARY_LENGTH = 90;
const API_ONLY_PREFIX = '[API only — no stories]';

let cache: Cache | null = null;

const isStory = (entry: IndexEntry): entry is StoryIndexEntry => {
  return entry.type === 'story' && entry.subtype === 'story' && (entry.tags?.includes('autodocs') ?? false);
};

const summarize = (description: string): string | undefined => {
  const normalized = description.replace(/\s+/g, ' ').trim();
  const sentence = /^.*?[.!?](?=\s|$)/.exec(normalized)?.[0] ?? normalized;

  if (!sentence) {
    return undefined;
  }

  return sentence.length > MAX_SUMMARY_LENGTH ? `${sentence.slice(0, MAX_SUMMARY_LENGTH - 1).trimEnd()}…` : sentence;
};

const stringAt = (value: unknown, path: string[]): string | undefined => {
  const result = readPath(value, path);

  return typeof result === 'string' && result.trim() ? result.trim() : undefined;
};

const safeExport = (evaluator: StaticEvaluator, file: string, name: string): unknown => {
  try {
    return evaluator.exportValue(file, name);
  } catch (error) {
    if (error instanceof Unresolvable) {
      return {};
    }

    throw error;
  }
};

const directiveHost = (code: string, selectors: HostSelector[]): string => {
  const attr = preferredSelector(selectors)?.attrs[0]?.name;

  return attr && new RegExp(`<button\\b[^>]*\\s${attr}[\\s=>]`).test(code) ? 'button' : 'div';
};

const buildStories = (
  entries: StoryIndexEntry[],
  file: string,
  csf: ReturnType<typeof loadCsf>,
  meta: unknown,
  host: (extra: string) => string | null,
  {evaluator}: BuildContext,
): StoryManifest[] => {
  return entries.map((entry) => {
    const exportName = entry.exportName ?? csf.indexInputs.find((input) => input.__id === entry.id)?.exportName;
    const story = exportName ? safeExport(evaluator, file, exportName) : {};
    const statement = exportName ? csf._storyStatements[exportName] : undefined;
    const description = stringAt(story, ['parameters', 'docs', 'description', 'story'])
      ?? (extractDescription(statement) || undefined);
    const {snippet, reason} = buildSnippet({
      meta,
      story,
      context: {id: entry.id, name: entry.name, title: entry.title},
      hostMarkup: host,
    });

    if (snippet === null) {
      logger.warn(`angular-manifest: no snippet for ${entry.id}: ${reason ?? 'unknown reason'}`);
    }

    return {
      id: entry.id,
      name: entry.name,
      ...(description ? {description} : {}),
      ...(snippet === null ? {} : {snippet}),
    };
  });
};

const componentManifest = (
  id: string,
  component: CompodocClass,
  entries: StoryIndexEntry[],
  code: string,
  context: BuildContext,
): ComponentManifest => {
  const [first] = entries;
  const file = resolve(context.rootDir, first.importPath);
  const csf = loadCsf(code, {makeTitle: (title) => title, fileName: file}).parse();
  const meta = context.evaluator.exportValue(file, 'default');
  const selectors = parseSelectors(component.selector);
  const preferred = preferredSelector(selectors);
  const hostFallback = component.kind === 'directive' ? directiveHost(code, selectors) : 'div';
  const host = (extra: string) => (preferred ? hostMarkup(preferred, hostFallback, extra) : null);
  const description = stringAt(meta, ['parameters', 'docs', 'description', 'component'])
    ?? (component.description || extractDescription(csf._metaStatement) || undefined);
  const rawPath = csf.indexInputs[0]?.rawComponentPath;
  const entryPoint = rawPath?.startsWith('@ndw-ui-kit/')
    ? rawPath
    : context.entryPoints.get(component.name) ?? DEFAULT_ENTRY_POINT;

  return {
    id,
    name: component.name,
    path: first.importPath,
    ...(description ? {description, summary: summarize(description)} : {}),
    import: `import { ${component.name} } from '${entryPoint}';`,
    ...(component.deprecated === null ? {} : {jsDocTags: {deprecated: [component.deprecated]}}),
    apiDescription: buildApiDescription({
      component,
      selectors,
      hostFallback,
      values: context.values,
      typeSources: context.typeSources,
      argTypes: readPath(meta, ['argTypes']),
      importLine: null,
    }),
    stories: buildStories(entries, file, csf, meta, host, context),
  };
};

const buildComponent = async (
  id: string,
  entries: StoryIndexEntry[],
  context: BuildContext,
): Promise<ComponentManifest | null> => {
  const [first] = entries;
  const file = resolve(context.rootDir, first.importPath);
  let componentName: string | undefined;

  try {
    const code = await readFile(file, 'utf8');

    componentName = loadCsf(code, {makeTitle: (title) => title, fileName: file}).parse().meta?.component;

    if (!componentName) {
      return null;
    }

    const component = context.data.classes.get(componentName);

    if (!component) {
      throw new Error(`${componentName} is not in the Compodoc JSON`);
    }

    return componentManifest(id, component, entries, code, context);
  } catch (error) {
    const {name, message} = error instanceof Error ? error : new Error(String(error));

    logger.warn(`angular-manifest: ${id} failed: ${message}`);

    return {id, name: componentName ?? id, path: first.importPath, error: {name, message}};
  }
};

const entrySegment = (specifier: string): string => {
  if (specifier === DEFAULT_ENTRY_POINT) {
    return 'core';
  }

  return specifier
    .replace(`${DEFAULT_ENTRY_POINT}/`, '')
    .replace('@ndw-ui-kit/', '')
    .replaceAll('/', '-');
};

const kebabName = (name: string): string => {
  return name
    .replace(/^Ndwu/, '')
    .replace(/(Component|Directive)$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
};

const isKitSelector = (selectors: HostSelector[]): boolean => {
  return selectors.some((selector) => {
    return (selector.element ?? '').startsWith('ndwu') || (selector.attrs[0]?.name ?? '').startsWith('ndwu');
  });
};

const apiOnlyManifest = (component: CompodocClass, entryPoint: string, context: BuildContext): ComponentManifest => {
  const id = `api-${entrySegment(entryPoint)}-${kebabName(component.name)}`;
  const path = `./${component.file}`;
  const importLine = `import { ${component.name} } from '${entryPoint}';`;

  try {
    const summary = summarize(component.description) ?? component.name;

    return {
      id,
      name: component.name,
      path,
      ...(component.description ? {description: component.description} : {}),
      summary: `${API_ONLY_PREFIX} ${summary}`,
      import: importLine,
      ...(component.deprecated === null ? {} : {jsDocTags: {deprecated: [component.deprecated]}}),
      apiDescription: buildApiDescription({
        component,
        selectors: parseSelectors(component.selector),
        hostFallback: 'div',
        values: context.values,
        typeSources: context.typeSources,
        argTypes: undefined,
        importLine,
      }),
      stories: [],
    };
  } catch (error) {
    const {name, message} = error instanceof Error ? error : new Error(String(error));

    logger.warn(`angular-manifest: ${id} failed: ${message}`);

    return {id, name: component.name, path, error: {name, message}};
  }
};

const apiOnlyComponents = (covered: Set<string>, context: BuildContext): Record<string, ComponentManifest> => {
  const result: Record<string, ComponentManifest> = {};

  for (const [name, entryPoint] of context.entryPoints) {
    const component = context.data.classes.get(name);

    if (component && !covered.has(name) && isKitSelector(parseSelectors(component.selector))) {
      const manifest = apiOnlyManifest(component, entryPoint, context);

      result[manifest.id] = manifest;
    }
  }

  return result;
};

const build = async (configDir: string, entries: StoryIndexEntry[]): Promise<BuildResult> => {
  const rootDir = dirname(configDir);
  const compodocPath = join(configDir, 'documentation.json');
  const data = await readCompodoc(compodocPath);
  const library = {variable: (_name: string): unknown => undefined};
  const evaluator = new StaticEvaluator({
    aliases: readPathAliases(configDir),
    packages: storyPackages((name) => library.variable(name)),
  });
  const values = new CompodocValues(data, evaluator, rootDir);

  library.variable = (name) => values.variable(name);

  const typeSources = new TypeSources(rootDir, data.typeFiles);
  const context: BuildContext = {rootDir, data, values, evaluator, typeSources, entryPoints: readEntryPoints(configDir)};
  const groups = new Map<string, StoryIndexEntry[]>();

  for (const entry of entries) {
    const id = getComponentIdFromEntry(entry);

    groups.set(id, [...(groups.get(id) ?? []), entry]);
  }

  const components: Record<string, ComponentManifest> = {};

  for (const [id, group] of groups) {
    const manifest = await buildComponent(id, group, context);

    if (manifest) {
      components[id] = manifest;
    }
  }

  const covered = new Set(Object.values(components).map((component) => component.name));
  const storyFiles = entries.map((entry) => resolve(rootDir, entry.importPath));

  return {components: {...components, ...apiOnlyComponents(covered, context)}, files: [...new Set([compodocPath, ...storyFiles, ...evaluator.files, ...typeSources.files])]};
};

const mtimes = (files: string[]): Promise<number[]> => {
  return Promise.all(files.map((file) => stat(file).then(({mtimeMs}) => mtimeMs, () => -1)));
};

const stamp = async (files: string[]): Promise<string> => {
  return (await mtimes(files)).join(',');
};

const cachedBuild = async (configDir: string, entries: StoryIndexEntry[]): Promise<BuildResult> => {
  const ids = entries
    .map((entry) => entry.id)
    .sort()
    .join(',');

  if (cache?.ids === ids && (cache.key === null || cache.key === await stamp(cache.files))) {
    return cache.result;
  }

  const startedAt = Date.now();
  const current: Cache = {ids, key: null, files: [], result: build(configDir, entries)};

  cache = current;

  try {
    const result = await current.result;
    const times = await mtimes(result.files);

    if (times.some((time) => time >= startedAt)) {
      if (cache === current) {
        cache = null;
      }
    } else {
      current.files = result.files;
      current.key = times.join(',');
    }

    return result;
  } catch (error) {
    cache = null;
    throw error;
  }
};

export const experimental_manifests = async (
  existing: Record<string, unknown> | undefined,
  {configDir, configType, manifestEntries}: ManifestsOptions,
): Promise<Record<string, unknown>> => {
  let components: Record<string, ComponentManifest>;

  try {
    ({components} = await cachedBuild(configDir, manifestEntries.filter(isStory)));
  } catch (error) {
    logger.error(`angular-manifest: manifest build failed: ${error instanceof Error ? error.message : String(error)}`);

    if (configType === 'PRODUCTION') {
      process.exitCode = 1;
    }

    throw error;
  }

  const previous = (existing?.components as ComponentsManifest | undefined)?.components ?? {};
  const manifest: ComponentsManifest = {v: 0, components: {...previous, ...components}};

  return {...existing, components: manifest};
};
