import {argsSourceTransform} from '../../helpers/args-to-source.js';
import {PackageResolver, Unresolvable, callable, invoke} from './static-eval.js';

export interface SnippetInput {
  meta: unknown;
  story: unknown;
  context: Record<string, unknown>;
  hostMarkup: (extra: string) => string | null;
}

export interface SnippetResult {
  snippet: string | null;
  reason: string | null;
}

const IDENTIFIER = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

const formatProp = (name: string): string => {
  return IDENTIFIER.test(name) ? name : `this['${name}']`;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    throw new Unresolvable('object expected');
  }

  return value as Record<string, unknown>;
};

const argsToTemplate = callable((args: unknown, options: unknown = {}): string => {
  const {include, exclude} = asRecord(options);

  return Object.entries(asRecord(args))
    .filter(([, value]) => value !== undefined)
    .filter(([key]) => {
      if (Array.isArray(include)) {
        return include.includes(key);
      }

      return Array.isArray(exclude) ? !exclude.includes(key) : true;
    })
    .map(([key, value]) => {
      return typeof value === 'function' ? `(${key})="${formatProp(key)}($event)"` : `[${key}]="${formatProp(key)}"`;
    })
    .join(' ');
});

const fn = callable(() => callable(() => undefined));

const BUILTIN_PACKAGES: Record<string, Record<string, unknown>> = {
  '@storybook/angular': {argsToTemplate},
  'storybook/test': {fn},
};

export const storyPackages = (library: (name: string) => unknown): PackageResolver => {
  return (source) => {
    const builtins = BUILTIN_PACKAGES[source];

    if (builtins) {
      return (name) => {
        if (!Object.hasOwn(builtins, name)) {
          throw new Unresolvable(`${name} of ${source}`);
        }

        return builtins[name];
      };
    }

    return source.startsWith('@ndw-ui-kit/') ? library : null;
  };
};

export const readPath = (value: unknown, path: string[]): unknown => {
  try {
    return path.reduce<unknown>((current, key) => {
      return typeof current === 'object' && current !== null && Object.hasOwn(current, key)
        ? (current as Record<string, unknown>)[key]
        : undefined;
    }, value);
  } catch (error) {
    if (error instanceof Unresolvable) {
      return undefined;
    }

    throw error;
  }
};

export const resolvedEntries = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const key of Object.keys(value)) {
    try {
      result[key] = (value as Record<string, unknown>)[key];
    } catch (error) {
      if (!(error instanceof Unresolvable)) {
        throw error;
      }
    }
  }

  return result;
};

const dedent = (code: string): string => {
  const [first = '', ...rest] = code.split('\n');
  const indents = rest.filter((line) => line.trim()).map((line) => /^[ \t]*/.exec(line)?.[0].length ?? 0);
  const indent = indents.length > 0 ? Math.min(...indents) : 0;

  return [first, ...rest.map((line) => line.slice(Math.min(indent, line.length - line.trimStart().length)))].join('\n');
};

const tidy = (code: string): string => {
  return dedent(code.trim())
    .replace(/(\S)[ \t]{2,}(?=\S)/g, '$1 ')
    .replace(/(\S)[ \t]+>/g, '$1>')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
};

const renderTemplate = (render: unknown, args: Record<string, unknown>, context: Record<string, unknown>): string => {
  const result = invoke(render, [args, {...context, args}]);
  const template = readPath(result, ['template']);

  if (typeof template !== 'string') {
    throw new Unresolvable('render returns no static template');
  }

  return template;
};

export const buildSnippet = ({meta, story, context, hostMarkup}: SnippetInput): SnippetResult => {
  const initialArgs = resolvedEntries(readPath(meta, ['args']));
  const args = {...initialArgs, ...resolvedEntries(readPath(story, ['args']))};
  const finish = (code: string): SnippetResult => {
    return {snippet: tidy(argsSourceTransform(code, {args, initialArgs})), reason: null};
  };
  const sourceCode = readPath(story, ['parameters', 'docs', 'source', 'code']);

  if (typeof sourceCode === 'string' && sourceCode.trim()) {
    return finish(sourceCode);
  }

  const owner = [story, meta].find((value) => typeof value === 'object' && value !== null && Object.hasOwn(value, 'render'));

  try {
    if (owner !== undefined) {
      return finish(renderTemplate(readPath(owner, ['render']), args, context));
    }

    const markup = hostMarkup(String(invoke(argsToTemplate, [args])));

    return markup ? finish(markup) : {snippet: null, reason: 'no render and no host selector'};
  } catch (error) {
    if (error instanceof Unresolvable) {
      return {snippet: null, reason: error.message};
    }

    throw error;
  }
};
