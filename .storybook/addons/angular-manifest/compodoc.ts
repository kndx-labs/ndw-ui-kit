import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {Scope, StaticEvaluator, Unresolvable} from './static-eval.js';

type Json = Record<string, unknown>;

export interface CompodocMember {
  name: string;
  type: string;
  defaultValue: string | null;
  required: boolean;
  description: string;
  deprecated: string | null;
}

export interface CompodocClass {
  name: string;
  kind: 'component' | 'directive';
  file: string;
  selector: string;
  description: string;
  deprecated: string | null;
  inputs: CompodocMember[];
  outputs: CompodocMember[];
  formControl: boolean;
}

interface CompodocVariable {
  defaultValue: string;
  file: string;
}

export interface CompodocData {
  classes: Map<string, CompodocClass>;
  variables: Map<string, CompodocVariable>;
  typeAliases: Map<string, string>;
}

export interface FormattedType {
  text: string;
  note: string | null;
}

const MAX_TYPE_MEMBERS = 12;
const MAX_ALIAS_DEPTH = 3;
const FORM_CONTROL_MARKERS = ['ControlValueAccessor', 'NG_VALUE_ACCESSOR'];

const isJson = (value: unknown): value is Json => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const list = (value: unknown): Json[] => {
  return Array.isArray(value) ? value.filter(isJson) : [];
};

const text = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const strings = (value: unknown): string[] => {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
};

const htmlToText = (html: string): string => {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const deprecation = (raw: Json): string | null => {
  return raw.deprecated === true ? text(raw.deprecationMessage).trim() || 'Deprecated' : null;
};

const toMember = (raw: Json): CompodocMember => {
  const {defaultValue} = raw;

  return {
    name: text(raw.name),
    type: text(raw.type),
    defaultValue: typeof defaultValue === 'string' && defaultValue !== 'undefined' ? defaultValue : null,
    required: raw.required === true,
    description: text(raw.rawdescription).trim(),
    deprecated: deprecation(raw),
  };
};

const baseName = (type: string): string => {
  return type.replace(/<.*$/s, '').trim();
};

const byName = (items: Json[]): Map<string, Json> => {
  const result = new Map<string, Json>();

  for (const item of items) {
    const name = text(item.name);

    if (name && !result.has(name)) {
      result.set(name, item);
    }
  }

  return result;
};

const isFormControl = (raw: Json, all: Map<string, Json>, depth = 0): boolean => {
  const markers = [...strings(raw.implements), ...list(raw.providers).map((provider) => text(provider.name))];

  if (markers.some((marker) => FORM_CONTROL_MARKERS.some((known) => marker.includes(known)))) {
    return true;
  }

  return depth < 5 && strings(raw.extends).some((parent) => {
    const parentRaw = all.get(baseName(parent));

    return parentRaw ? isFormControl(parentRaw, all, depth + 1) : false;
  });
};

const hostDirectiveMembers = (raw: Json, directives: Map<string, Json>, key: 'inputs' | 'outputs'): CompodocMember[] => {
  const classKey = key === 'inputs' ? 'inputsClass' : 'outputsClass';

  return list(raw.hostDirectives).flatMap((host) => {
    const directive = directives.get(text(host.name));
    const members = directive ? list(directive[classKey]).map(toMember) : [];

    return strings(host[key]).flatMap((mapping) => {
      const [inner = '', outer = inner] = mapping.split(':').map((part) => part.trim());
      const member = members.find((candidate) => candidate.name === inner);

      return member ? [{...member, name: outer}] : [];
    });
  });
};

const mergeMembers = (own: CompodocMember[], inherited: CompodocMember[]): CompodocMember[] => {
  const result = new Map<string, CompodocMember>();

  for (const member of [...own, ...inherited]) {
    if (!result.has(member.name)) {
      result.set(member.name, member);
    }
  }

  return [...result.values()];
};

const toClass = (
  raw: Json,
  kind: CompodocClass['kind'],
  directives: Map<string, Json>,
  all: Map<string, Json>,
): CompodocClass => {
  const description = text(raw.rawdescription).trim() || htmlToText(text(raw.description));

  return {
    name: text(raw.name),
    kind,
    file: text(raw.file),
    selector: text(raw.selector),
    description,
    deprecated: deprecation(raw),
    inputs: mergeMembers(list(raw.inputsClass).map(toMember), hostDirectiveMembers(raw, directives, 'inputs')),
    outputs: mergeMembers(list(raw.outputsClass).map(toMember), hostDirectiveMembers(raw, directives, 'outputs')),
    formControl: isFormControl(raw, all),
  };
};

export const readCompodoc = async (path: string): Promise<CompodocData> => {
  const json: unknown = JSON.parse(await readFile(path, 'utf8'));

  if (!isJson(json)) {
    throw new Error(`${path} is not a Compodoc JSON`);
  }

  const components = list(json.components);
  const directives = list(json.directives);
  const directivesByName = byName(directives);
  const all = byName([...components, ...directives, ...list(json.classes)]);
  const miscellaneous = isJson(json.miscellaneous) ? json.miscellaneous : {};
  const classes = new Map<string, CompodocClass>();

  for (const raw of components) {
    classes.set(text(raw.name), toClass(raw, 'component', directivesByName, all));
  }

  for (const raw of directives) {
    classes.set(text(raw.name), toClass(raw, 'directive', directivesByName, all));
  }

  const variables = new Map<string, CompodocVariable>();

  for (const [name, raw] of byName(list(miscellaneous.variables))) {
    variables.set(name, {defaultValue: text(raw.defaultValue), file: text(raw.file)});
  }

  const typeAliases = new Map<string, string>();

  for (const [name, raw] of byName(list(miscellaneous.typealiases))) {
    typeAliases.set(name, text(raw.rawtype));
  }

  return {classes, variables, typeAliases};
};

export const literal = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return `'${value.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'`;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return String(value);
  }

  return null;
};

export const splitUnion = (type: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let current = '';

  for (const char of type) {
    if (quote) {
      quote = char === quote ? null : quote;
    } else if (char === '"' || char === '\'') {
      quote = char;
    } else if ('<([{'.includes(char)) {
      depth++;
    } else if ('>)]}'.includes(char)) {
      depth--;
    } else if (char === '|' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  parts.push(current);

  return parts.map((part) => part.trim()).filter((part) => part.length > 0);
};

export class CompodocValues {
  private readonly scope: Scope;

  constructor(
    private readonly data: CompodocData,
    private readonly evaluator: StaticEvaluator,
    private readonly rootDir: string,
  ) {
    const values = new Map<string, unknown>();

    this.scope = evaluator.createScope((name) => {
      if (!values.has(name)) {
        values.set(name, this.variable(name));
      }

      return values.get(name);
    });
  }

  public evaluate(code: string): unknown {
    return this.evaluator.evaluateCode(code, this.scope);
  }

  public variable(name: string): unknown {
    const variable = this.data.variables.get(name);

    if (!variable) {
      throw new Unresolvable(`Compodoc variable ${name}`);
    }

    try {
      return this.evaluate(variable.defaultValue);
    } catch (error) {
      if (!(error instanceof Unresolvable) || !variable.file) {
        throw error;
      }

      return this.evaluator.exportValue(join(this.rootDir, variable.file), name);
    }
  }

  public formatType(type: string): FormattedType {
    const members: string[] = [];
    const notes: string[] = [];

    for (const member of splitUnion(type)) {
      const expanded = this.expand(member, 0);

      if (!expanded) {
        members.push(member);
      } else if (expanded.values.length > MAX_TYPE_MEMBERS) {
        const examples = expanded.values.slice(0, 2).join(', ');
        const source = expanded.source ? `; see \`${expanded.source}\`` : '';

        members.push(member);
        notes.push(`${member}: ${expanded.values.length} values, e.g. ${examples}${source}`);
      } else {
        members.push(...expanded.values);
      }
    }

    return {text: [...new Set(members)].join(' | '), note: notes.length > 0 ? notes.join('; ') : null};
  }

  private literals(values: unknown[]): string[] | null {
    const result = values.map(literal);

    return result.every((value): value is string => value !== null) ? result : null;
  }

  private objectOf(name: string): Record<string, unknown> | null {
    try {
      const value = this.variable(name);

      return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
    } catch (error) {
      if (error instanceof Unresolvable) {
        return null;
      }

      throw error;
    }
  }

  private expand(member: string, depth: number): {values: string[]; source: string | null} | null {
    const quoted = /^(["'])(.*)\1$/s.exec(member);

    if (quoted) {
      return {values: [literal(quoted[2]) ?? member], source: null};
    }

    if (/^(?:-?\d+(?:\.\d+)?|true|false|null|undefined)$/.test(member)) {
      return {values: [member], source: null};
    }

    const valuesOf = /^(?:NdwuValues<typeof (\w+)>|\(?typeof (\w+)\)?\[['"]?keyof typeof \w+['"]?\])$/.exec(member);
    const valuesSource = valuesOf?.[1] ?? valuesOf?.[2];

    if (valuesSource) {
      const object = this.objectOf(valuesSource);
      const values = object ? this.literals(Object.values(object)) : null;

      return values ? {values, source: valuesSource} : null;
    }

    const keysOf = /^keyof typeof (\w+)$/.exec(member);

    if (keysOf?.[1]) {
      const object = this.objectOf(keysOf[1]);

      return object ? {values: Object.keys(object).map((key) => `'${key}'`), source: keysOf[1]} : null;
    }

    const rawType = this.data.typeAliases.get(member);

    if (rawType === undefined || depth >= MAX_ALIAS_DEPTH || rawType.includes('literal type')) {
      return null;
    }

    const parts = splitUnion(rawType).map((part) => this.expand(part, depth + 1));

    if (parts.some((part) => part === null)) {
      return null;
    }

    const expanded = parts.filter((part) => part !== null);
    const sources = expanded.map((part) => part.source).filter((source) => source !== null);

    return {values: [...new Set(expanded.flatMap((part) => part.values))], source: sources[0] ?? null};
  }
}
