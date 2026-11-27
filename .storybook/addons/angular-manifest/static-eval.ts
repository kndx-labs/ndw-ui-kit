import {existsSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {parser, types as t} from 'storybook/internal/babel';

type Thunk = () => unknown;
type Callable = (...args: unknown[]) => unknown;
type FunctionNode = t.ArrowFunctionExpression | t.FunctionExpression | t.FunctionDeclaration | t.ObjectMethod;

export type PackageResolver = (source: string) => ((name: string) => unknown) | null;

export interface StaticEvaluatorOptions {
  aliases: Record<string, string>;
  packages: PackageResolver;
}

interface ModuleRecord {
  file: string;
  scope: Scope;
  exports: Map<string, Thunk>;
  reexports: string[];
}

export class Unresolvable extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'Unresolvable';
  }
}

const MAX_MODULE_DEPTH = 10;
const MAX_CALL_DEPTH = 200;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const SHORT_CIRCUIT = Symbol('short-circuit');
const CALLABLES = new WeakSet<object>();
const PARSER_PLUGINS: parser.ParserPlugin[] = ['typescript', 'decorators-legacy'];

export const callable = <F extends Callable>(fn: F): F => {
  CALLABLES.add(fn);

  return fn;
};

const memo = (thunk: Thunk): Thunk => {
  let state: 'idle' | 'pending' | 'done' = 'idle';
  let value: unknown;

  return () => {
    if (state === 'done') {
      return value;
    }

    if (state === 'pending') {
      throw new Unresolvable('circular reference');
    }

    state = 'pending';

    try {
      value = thunk();
      state = 'done';

      return value;
    } catch (error) {
      state = 'idle';
      throw error;
    }
  };
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const toNumber = (value: unknown): number => {
  if (typeof value !== 'number') {
    throw new Unresolvable('number expected');
  }

  return value;
};

const toText = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new Unresolvable('string expected');
  }

  return value;
};

export const invoke = (fn: unknown, args: unknown[]): unknown => {
  if (typeof fn !== 'function' || !CALLABLES.has(fn)) {
    throw new Unresolvable('call of an unknown function');
  }

  return (fn as Callable)(...args);
};

const arrayMethod = (array: unknown[], name: string): Callable | null => {
  const each = (fn: unknown) => (item: unknown, index: number) => invoke(fn, [item, index, array]);

  switch (name) {
    case 'map':
      return (fn) => array.map(each(fn));
    case 'filter':
      return (fn) => array.filter(each(fn));
    case 'flatMap':
      return (fn) => array.flatMap(each(fn));
    case 'find':
      return (fn) => array.find(each(fn));
    case 'some':
      return (fn) => array.some(each(fn));
    case 'every':
      return (fn) => array.every(each(fn));
    case 'join':
      return (separator) => array.join(separator === undefined ? ',' : toText(separator));
    case 'slice':
      return (start, end) => array.slice(start as number | undefined, end as number | undefined);
    case 'includes':
      return (value) => array.includes(value);
    case 'concat':
      return (...items) => array.concat(...items);
    default:
      return null;
  }
};

const stringMethod = (text: string, name: string): Callable | null => {
  switch (name) {
    case 'toLowerCase':
      return () => text.toLowerCase();
    case 'toUpperCase':
      return () => text.toUpperCase();
    case 'trim':
      return () => text.trim();
    case 'replace':
      return (search, replacement) => text.replace(toText(search), toText(replacement));
    case 'replaceAll':
      return (search, replacement) => text.replaceAll(toText(search), toText(replacement));
    case 'split':
      return (separator) => text.split(toText(separator));
    case 'startsWith':
      return (search) => text.startsWith(toText(search));
    case 'endsWith':
      return (search) => text.endsWith(toText(search));
    case 'includes':
      return (search) => text.includes(toText(search));
    case 'slice':
      return (start, end) => text.slice(start as number | undefined, end as number | undefined);
    default:
      return null;
  }
};

const readMember = (object: unknown, key: unknown): unknown => {
  if (typeof key !== 'string' && typeof key !== 'number') {
    throw new Unresolvable('unsupported property key');
  }

  const name = String(key);

  if (FORBIDDEN_KEYS.has(name)) {
    throw new Unresolvable(`property ${name}`);
  }

  if (typeof object === 'string' || Array.isArray(object)) {
    if (name === 'length') {
      return object.length;
    }

    if (/^\d+$/.test(name)) {
      return object[Number(name)];
    }

    const method = typeof object === 'string' ? stringMethod(object, name) : arrayMethod(object, name);

    if (!method) {
      throw new Unresolvable(`method ${name}`);
    }

    return callable(method);
  }

  if (isObject(object)) {
    return Object.hasOwn(object, name) ? object[name] : undefined;
  }

  throw new Unresolvable(`cannot read ${name} of ${String(object)}`);
};

const createGlobals = (): Record<string, unknown> => {
  const toObject = (value: unknown): object => {
    if (!isObject(value)) {
      throw new Unresolvable('object expected');
    }

    return value;
  };

  return {
    undefined: undefined,
    Object: {
      values: callable((value): unknown[] => Object.values(toObject(value) as Record<string, unknown>)),
      keys: callable((value) => Object.keys(toObject(value))),
      entries: callable((value) => Object.entries(toObject(value))),
      fromEntries: callable((value) => Object.fromEntries(value as Iterable<readonly [PropertyKey, unknown]>)),
    },
    Array: {
      isArray: callable((value) => Array.isArray(value)),
    },
    String: callable((value) => String(value)),
    Number: callable((value) => Number(value)),
    Boolean: callable((value) => Boolean(value)),
  };
};

export class Scope {
  private readonly bindings = new Map<string, Thunk>();

  constructor(
    private readonly parent: Scope | null,
    private readonly fallback: ((name: string) => unknown) | null = null,
  ) {}

  public define(name: string, thunk: Thunk): void {
    this.bindings.set(name, memo(thunk));
  }

  public lookup(name: string): unknown {
    const thunk = this.binding(name);

    if (thunk) {
      return thunk();
    }

    const fallback = this.nearestFallback();

    if (fallback) {
      return fallback(name);
    }

    throw new Unresolvable(`identifier ${name}`);
  }

  private binding(name: string): Thunk | undefined {
    return this.bindings.get(name) ?? this.parent?.binding(name);
  }

  private nearestFallback(): ((name: string) => unknown) | null {
    return this.fallback ?? this.parent?.nearestFallback() ?? null;
  }
}

export class StaticEvaluator {
  public readonly files = new Set<string>();

  private readonly modules = new Map<string, ModuleRecord>();
  private readonly globals = new Scope(null);
  private callDepth = 0;

  constructor(private readonly options: StaticEvaluatorOptions) {
    for (const [name, value] of Object.entries(createGlobals())) {
      this.globals.define(name, () => value);
    }
  }

  public createScope(fallback: (name: string) => unknown): Scope {
    return new Scope(this.globals, fallback);
  }

  public evaluateCode(code: string, scope: Scope): unknown {
    return this.evaluate(parser.parseExpression(code, {plugins: PARSER_PLUGINS}), scope);
  }

  public exportValue(file: string, name: string): unknown {
    const thunk = this.findExport(file, name, 0);

    if (!thunk) {
      throw new Unresolvable(`export ${name} of ${file}`);
    }

    return thunk();
  }

  public evaluate(node: t.Node, scope: Scope): unknown {
    switch (node.type) {
      case 'StringLiteral':
      case 'NumericLiteral':
      case 'BooleanLiteral':
        return node.value;
      case 'NullLiteral':
        return null;
      case 'Identifier':
        return scope.lookup(node.name);
      case 'TemplateLiteral':
        return this.template(node, scope);
      case 'TSAsExpression':
      case 'TSSatisfiesExpression':
      case 'TSNonNullExpression':
      case 'TSTypeAssertion':
      case 'ParenthesizedExpression':
        return this.evaluate(node.expression, scope);
      case 'ArrayExpression':
        return this.array(node.elements, scope);
      case 'ObjectExpression':
        return this.object(node, scope);
      case 'MemberExpression':
      case 'OptionalMemberExpression':
      case 'CallExpression':
      case 'OptionalCallExpression': {
        const value = this.chain(node, scope);

        return value === SHORT_CIRCUIT ? undefined : value;
      }
      case 'ConditionalExpression':
        return this.evaluate(this.evaluate(node.test, scope) ? node.consequent : node.alternate, scope);
      case 'LogicalExpression':
        return this.logical(node, scope);
      case 'BinaryExpression':
        return this.binary(node, scope);
      case 'UnaryExpression':
        return this.unary(node, scope);
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        return this.closure(node, scope);
      default:
        throw new Unresolvable(`unsupported ${node.type}`);
    }
  }

  private template(node: t.TemplateLiteral, scope: Scope): string {
    return node.quasis
      .map((quasi, index) => {
        const expression = node.expressions[index];
        const value = expression ? String(this.evaluate(expression, scope)) : '';

        return `${quasi.value.cooked ?? quasi.value.raw}${value}`;
      })
      .join('');
  }

  private spread(value: unknown): unknown[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return [...value];
    }

    throw new Unresolvable('spread of a non-iterable');
  }

  private array(elements: (t.Expression | t.SpreadElement | t.ArgumentPlaceholder | null)[], scope: Scope): unknown[] {
    return elements.flatMap((element) => {
      if (element === null) {
        return [undefined];
      }

      if (t.isSpreadElement(element)) {
        return this.spread(this.evaluate(element.argument, scope));
      }

      return [this.evaluate(element, scope)];
    });
  }

  private propertyKey(property: t.ObjectProperty | t.ObjectMethod, scope: Scope): string {
    const {key} = property;

    if (property.computed) {
      const value = this.evaluate(key, scope);

      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new Unresolvable('computed key');
      }

      return String(value);
    }

    if (t.isIdentifier(key)) {
      return key.name;
    }

    if (t.isStringLiteral(key) || t.isNumericLiteral(key)) {
      return String(key.value);
    }

    throw new Unresolvable(`key ${key.type}`);
  }

  private object(node: t.ObjectExpression, scope: Scope): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const property of node.properties) {
      if (t.isSpreadElement(property)) {
        const source = this.evaluate(property.argument, scope);

        if (isObject(source)) {
          Object.defineProperties(result, Object.getOwnPropertyDescriptors(source));
        } else if (source !== null && source !== undefined) {
          throw new Unresolvable('spread of a non-object');
        }

        continue;
      }

      const key = this.propertyKey(property, scope);
      const thunk: Thunk = t.isObjectMethod(property)
        ? () => this.closure(property, scope)
        : () => {
          if (!t.isExpression(property.value)) {
            throw new Unresolvable('pattern in object literal');
          }

          return this.evaluate(property.value, scope);
        };

      Object.defineProperty(result, key, {enumerable: true, configurable: true, get: memo(thunk)});
    }

    return result;
  }

  private chain(node: t.Node, scope: Scope): unknown {
    if (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) {
      const object = this.chain(node.object, scope);

      if (object === SHORT_CIRCUIT || (node.optional && (object === null || object === undefined))) {
        return SHORT_CIRCUIT;
      }

      const key = node.computed || !t.isIdentifier(node.property)
        ? this.evaluate(node.property, scope)
        : node.property.name;

      return readMember(object, key);
    }

    if (t.isCallExpression(node) || t.isOptionalCallExpression(node)) {
      const callee = this.chain(node.callee, scope);

      if (callee === SHORT_CIRCUIT || (node.optional && (callee === null || callee === undefined))) {
        return SHORT_CIRCUIT;
      }

      return invoke(callee, this.array(node.arguments, scope));
    }

    return this.evaluate(node, scope);
  }

  private logical(node: t.LogicalExpression, scope: Scope): unknown {
    const left = this.evaluate(node.left, scope);

    switch (node.operator) {
      case '&&':
        return left ? this.evaluate(node.right, scope) : left;
      case '||':
        return left ? left : this.evaluate(node.right, scope);
      default:
        return left ?? this.evaluate(node.right, scope);
    }
  }

  private binary(node: t.BinaryExpression, scope: Scope): unknown {
    if (!t.isExpression(node.left)) {
      throw new Unresolvable('private name');
    }

    const left = this.evaluate(node.left, scope);
    const right = this.evaluate(node.right, scope);

    switch (node.operator) {
      case '+':
        return typeof left === 'string' || typeof right === 'string'
          ? `${String(left)}${String(right)}`
          : toNumber(left) + toNumber(right);
      case '-':
        return toNumber(left) - toNumber(right);
      case '*':
        return toNumber(left) * toNumber(right);
      case '/':
        return toNumber(left) / toNumber(right);
      case '%':
        return toNumber(left) % toNumber(right);
      case '===':
        return left === right;
      case '!==':
        return left !== right;
      case '<':
        return toNumber(left) < toNumber(right);
      case '>':
        return toNumber(left) > toNumber(right);
      case '<=':
        return toNumber(left) <= toNumber(right);
      case '>=':
        return toNumber(left) >= toNumber(right);
      default:
        throw new Unresolvable(`operator ${node.operator}`);
    }
  }

  private unary(node: t.UnaryExpression, scope: Scope): unknown {
    switch (node.operator) {
      case '!':
        return !this.evaluate(node.argument, scope);
      case '-':
        return -toNumber(this.evaluate(node.argument, scope));
      case '+':
        return toNumber(this.evaluate(node.argument, scope));
      case 'void':
        return undefined;
      default:
        throw new Unresolvable(`operator ${node.operator}`);
    }
  }

  private closure(node: FunctionNode, scope: Scope): Callable {
    if (node.async || node.generator) {
      throw new Unresolvable('async or generator function');
    }

    return callable((...args: unknown[]) => {
      if (this.callDepth >= MAX_CALL_DEPTH) {
        throw new Unresolvable('call depth');
      }

      this.callDepth++;

      try {
        const local = new Scope(scope);

        node.params.forEach((param, index) => {
          if (t.isRestElement(param)) {
            this.bind(param.argument, () => args.slice(index), local);
          } else {
            this.bind(param, () => args[index], local);
          }
        });

        return t.isBlockStatement(node.body) ? this.block(node.body, local) : this.evaluate(node.body, local);
      } finally {
        this.callDepth--;
      }
    });
  }

  private block(block: t.BlockStatement, scope: Scope): unknown {
    for (const statement of block.body) {
      if (t.isReturnStatement(statement)) {
        return statement.argument ? this.evaluate(statement.argument, scope) : undefined;
      }

      if (t.isVariableDeclaration(statement)) {
        this.declare(statement, scope);
      } else if (t.isFunctionDeclaration(statement) && statement.id) {
        scope.define(statement.id.name, () => this.closure(statement, scope));
      } else if (!t.isExpressionStatement(statement) && !t.isEmptyStatement(statement)) {
        throw new Unresolvable(`statement ${statement.type}`);
      }
    }

    return undefined;
  }

  private declare(declaration: t.VariableDeclaration, scope: Scope): void {
    for (const declarator of declaration.declarations) {
      const {init} = declarator;

      this.bind(declarator.id, () => (init ? this.evaluate(init, scope) : undefined), scope);
    }
  }

  private bind(pattern: t.Node, thunk: Thunk, scope: Scope): void {
    const value = memo(thunk);

    if (t.isIdentifier(pattern)) {
      scope.define(pattern.name, value);
    } else if (t.isAssignmentPattern(pattern)) {
      this.bind(pattern.left, () => {
        const current = value();

        return current === undefined ? this.evaluate(pattern.right, scope) : current;
      }, scope);
    } else if (t.isObjectPattern(pattern)) {
      this.bindObject(pattern, value, scope);
    } else if (t.isArrayPattern(pattern)) {
      pattern.elements.forEach((element, index) => {
        if (t.isRestElement(element)) {
          this.bind(element.argument, () => this.spread(value()).slice(index), scope);
        } else if (element) {
          this.bind(element, () => readMember(value(), index), scope);
        }
      });
    } else {
      throw new Unresolvable(`pattern ${pattern.type}`);
    }
  }

  private bindObject(pattern: t.ObjectPattern, value: Thunk, scope: Scope): void {
    const used: string[] = [];

    for (const property of pattern.properties) {
      if (t.isRestElement(property)) {
        this.bind(property.argument, () => {
          const source = value();

          if (!isObject(source)) {
            throw new Unresolvable('rest of a non-object');
          }

          return Object.fromEntries(Object.entries(source).filter(([key]) => !used.includes(key)));
        }, scope);
        continue;
      }

      const key = this.propertyKey(property, scope);

      used.push(key);
      this.bind(property.value, () => readMember(value(), key), scope);
    }
  }

  private resolveFile(source: string, from: string): string | null {
    let base: string | null = null;

    if (source.startsWith('.')) {
      base = resolve(dirname(from), source);
    } else {
      const alias = Object.entries(this.options.aliases).find(([prefix]) => source.startsWith(prefix));

      base = alias ? join(alias[1], source.slice(alias[0].length)) : null;
    }

    if (!base) {
      return null;
    }

    const stripped = base.replace(/\.js$/, '');

    return [`${stripped}.ts`, join(stripped, 'index.ts'), base]
      .find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
  }

  private importValue(source: string, name: string, from: string, depth: number): unknown {
    const resolvePackage = this.options.packages(source);

    if (resolvePackage) {
      return resolvePackage(name);
    }

    const file = this.resolveFile(source, from);

    if (!file) {
      throw new Unresolvable(`module ${source}`);
    }

    const thunk = this.findExport(file, name, depth + 1);

    if (!thunk) {
      throw new Unresolvable(`export ${name} of ${source}`);
    }

    return thunk();
  }

  private findExport(file: string, name: string, depth: number): Thunk | null {
    if (depth > MAX_MODULE_DEPTH) {
      throw new Unresolvable('module depth');
    }

    const record = this.load(file, depth);
    const own = record.exports.get(name);

    if (own) {
      return own;
    }

    for (const source of record.reexports) {
      const target = this.resolveFile(source, file);
      const found = target ? this.findExport(target, name, depth + 1) : null;

      if (found) {
        return found;
      }
    }

    return null;
  }

  private load(file: string, depth: number): ModuleRecord {
    const cached = this.modules.get(file);

    if (cached) {
      return cached;
    }

    const ast = parser.parse(readFileSync(file, 'utf8'), {sourceType: 'module', plugins: PARSER_PLUGINS});
    const record: ModuleRecord = {file, scope: new Scope(this.globals), exports: new Map(), reexports: []};

    this.files.add(file);
    this.modules.set(file, record);

    for (const statement of ast.program.body) {
      this.loadStatement(statement, record, depth);
    }

    return record;
  }

  private loadStatement(statement: t.Statement, record: ModuleRecord, depth: number): void {
    const {scope, exports} = record;

    if (t.isImportDeclaration(statement)) {
      this.loadImport(statement, record, depth);
    } else if (t.isExportNamedDeclaration(statement)) {
      this.loadNamedExport(statement, record, depth);
    } else if (t.isExportAllDeclaration(statement)) {
      record.reexports.push(statement.source.value);
    } else if (t.isExportDefaultDeclaration(statement)) {
      const {declaration} = statement;

      exports.set('default', memo(() => {
        if (t.isFunctionDeclaration(declaration)) {
          return this.closure(declaration, scope);
        }

        if (!t.isExpression(declaration)) {
          throw new Unresolvable(`default export ${declaration.type}`);
        }

        return this.evaluate(declaration, scope);
      }));
    } else {
      this.loadDeclaration(statement, scope);
    }
  }

  private loadDeclaration(statement: t.Node, scope: Scope): string[] {
    if (t.isVariableDeclaration(statement)) {
      this.declare(statement, scope);

      return statement.declarations.flatMap((declarator) => Object.keys(t.getBindingIdentifiers(declarator.id)));
    }

    if (t.isFunctionDeclaration(statement) && statement.id) {
      scope.define(statement.id.name, () => this.closure(statement, scope));

      return [statement.id.name];
    }

    if (t.isClassDeclaration(statement) && statement.id) {
      const {name} = statement.id;

      scope.define(name, () => {
        throw new Unresolvable(`class ${name}`);
      });

      return [name];
    }

    return [];
  }

  private loadImport(statement: t.ImportDeclaration, record: ModuleRecord, depth: number): void {
    if (statement.importKind === 'type') {
      return;
    }

    const source = statement.source.value;

    for (const specifier of statement.specifiers) {
      if (t.isImportSpecifier(specifier) && specifier.importKind === 'type') {
        continue;
      }

      const local = specifier.local.name;

      if (t.isImportNamespaceSpecifier(specifier)) {
        record.scope.define(local, () => {
          throw new Unresolvable(`namespace import ${source}`);
        });
        continue;
      }

      const imported = t.isImportDefaultSpecifier(specifier)
        ? 'default'
        : t.isIdentifier(specifier.imported) ? specifier.imported.name : specifier.imported.value;

      record.scope.define(local, () => this.importValue(source, imported, record.file, depth));
    }
  }

  private loadNamedExport(statement: t.ExportNamedDeclaration, record: ModuleRecord, depth: number): void {
    const {scope, exports} = record;

    if (statement.declaration) {
      for (const name of this.loadDeclaration(statement.declaration, scope)) {
        exports.set(name, () => scope.lookup(name));
      }

      return;
    }

    for (const specifier of statement.specifiers) {
      if (!t.isExportSpecifier(specifier) || specifier.exportKind === 'type') {
        continue;
      }

      const exported = t.isIdentifier(specifier.exported) ? specifier.exported.name : specifier.exported.value;
      const local = specifier.local.name;
      const source = statement.source?.value;

      exports.set(
        exported,
        source === undefined
          ? () => scope.lookup(local)
          : memo(() => this.importValue(source, local, record.file, depth)),
      );
    }
  }
}
