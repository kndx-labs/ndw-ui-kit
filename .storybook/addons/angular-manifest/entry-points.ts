import {existsSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {parser, types as t} from 'storybook/internal/babel';
import ts from 'typescript';

const PACKAGE_PREFIX = '@ndw-ui-kit/';

const resolveSource = (source: string, from: string): string | null => {
  const base = resolve(dirname(from), source).replace(/\.js$/, '');

  return [`${base}.ts`, join(base, 'index.ts')]
    .find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
};

const exportedName = (node: t.Identifier | t.StringLiteral): string => {
  return t.isIdentifier(node) ? node.name : node.value;
};

const declaredNames = (declaration: t.Declaration): string[] => {
  if (t.isVariableDeclaration(declaration)) {
    return declaration.declarations.flatMap((declarator) => Object.keys(t.getBindingIdentifiers(declarator.id)));
  }

  if ((t.isClassDeclaration(declaration) || t.isFunctionDeclaration(declaration)) && declaration.id) {
    return [declaration.id.name];
  }

  return [];
};

const collectExports = (file: string, names: Set<string>, visited: Set<string>): void => {
  if (visited.has(file)) {
    return;
  }

  visited.add(file);

  const ast = parser.parse(readFileSync(file, 'utf8'), {
    sourceType: 'module',
    plugins: ['typescript', 'decorators-legacy'],
  });

  for (const statement of ast.program.body) {
    if (t.isExportAllDeclaration(statement) && statement.exportKind !== 'type') {
      const target = resolveSource(statement.source.value, file);

      if (target) {
        collectExports(target, names, visited);
      }
    } else if (t.isExportNamedDeclaration(statement) && statement.exportKind !== 'type') {
      if (statement.declaration) {
        declaredNames(statement.declaration).forEach((name) => names.add(name));
      }

      for (const specifier of statement.specifiers) {
        if (t.isExportSpecifier(specifier) && specifier.exportKind !== 'type') {
          names.add(exportedName(specifier.exported));
        }
      }
    }
  }
};

const readPaths = (configDir: string): Record<string, string> => {
  const path = join(configDir, 'tsconfig.json');
  const {config, error} = ts.readConfigFile(path, (file) => ts.sys.readFile(file));

  if (error) {
    throw new Error(`${path}: ${ts.flattenDiagnosticMessageText(error.messageText, '\n')}`);
  }

  const compilerOptions = (config as {compilerOptions?: {baseUrl?: string; paths?: Record<string, string[]>}})
    .compilerOptions ?? {};
  const baseDir = resolve(configDir, compilerOptions.baseUrl ?? '.');
  const result: Record<string, string> = {};

  for (const [specifier, [target]] of Object.entries(compilerOptions.paths ?? {})) {
    if (target) {
      result[specifier] = resolve(baseDir, target);
    }
  }

  return result;
};

export const readPathAliases = (configDir: string): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(readPaths(configDir))
      .filter(([specifier]) => specifier.endsWith('/*'))
      .map(([specifier, target]) => [specifier.slice(0, -1), target.replace(/\*$/, '')]),
  );
};

export const readEntryPoints = (configDir: string): Map<string, string> => {
  const entries = Object.entries(readPaths(configDir))
    .filter(([specifier, file]) => {
      return specifier.startsWith(PACKAGE_PREFIX) && existsSync(join(dirname(file), 'ng-package.json'));
    })
    .sort(([left], [right]) => left.length - right.length);
  const result = new Map<string, string>();

  for (const [specifier, file] of entries) {
    const names = new Set<string>();

    collectExports(file, names, new Set());
    names.forEach((name) => result.set(name, specifier));
  }

  return result;
};
