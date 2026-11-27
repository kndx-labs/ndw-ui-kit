import {CompodocClass, CompodocMember, CompodocValues, literal} from './compodoc.js';
import {HostSelector, describeSelector, hostMarkup, preferredSelector} from './selector.js';
import {readPath} from './snippet.js';
import {Unresolvable} from './static-eval.js';
import {TypeSources} from './type-source.js';

export interface ApiDescriptionInput {
  component: CompodocClass;
  selectors: HostSelector[];
  hostFallback: string;
  values: CompodocValues;
  typeSources: TypeSources;
  argTypes: unknown;
  importLine: string | null;
}

interface TypeReference {
  name: string;
  nested: boolean;
}

const MAX_REFERENCED_TYPES = 8;

const FORM_CONTROL_NOTE = [
  '**Form control:** bind it with `[formControl]` / `formControlName` (ReactiveFormsModule)',
  'or `[(ngModel)]` (FormsModule); the control sets the value and the disabled state.',
].join(' ');

const typeBaseName = (name: string): string => {
  return name.replace(/(Component|Directive)$/, '');
};

const propertyName = (name: string): string => {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) ? name : `'${name}'`;
};

const formatDefault = (code: string, values: CompodocValues): string | null => {
  try {
    const value = values.evaluate(code);

    return value === undefined ? null : literal(value) ?? code;
  } catch (error) {
    if (error instanceof Unresolvable) {
      return code.replace(/\s+/g, ' ');
    }

    throw error;
  }
};

const memberDescription = (member: CompodocMember, argTypes: unknown): string => {
  const fromArgTypes = readPath(argTypes, [member.name, 'description']);

  return (member.description || (typeof fromArgTypes === 'string' ? fromArgTypes : '')).replace(/\s+/g, ' ').trim();
};

const docComment = (parts: (string | null)[]): string[] => {
  const content = parts
    .filter((part): part is string => !!part)
    .join(' ')
    .replaceAll('*/', '*\\/');

  return content ? [`  /** ${content} */`] : [];
};

const inputLines = (input: CompodocMember, {component, values, argTypes}: ApiDescriptionInput): string[] => {
  const type = values.formatType(input.type || 'unknown');
  const defaultValue = input.defaultValue === null ? null : formatDefault(input.defaultValue, values);
  const twoWay = component.outputs.some((output) => output.name === `${input.name}Change`)
    ? `two-way: [(${input.name})]`
    : null;
  const comments = [twoWay, type.note].filter((comment) => comment !== null);

  return [
    ...docComment([
      input.required ? 'Required.' : null,
      memberDescription(input, argTypes),
      defaultValue === null ? null : `@default ${defaultValue}`,
      input.deprecated === null ? null : `@deprecated ${input.deprecated}`,
    ]),
    `  ${propertyName(input.name)}${input.required ? '' : '?'}: ${type.text};${comments.length > 0 ? ` // ${comments.join('; ')}` : ''}`,
  ];
};

const outputLines = (output: CompodocMember, {values, argTypes}: ApiDescriptionInput): string[] => {
  const type = values.formatType(output.type || 'void');

  return [
    ...docComment([
      memberDescription(output, argTypes),
      output.deprecated === null ? null : `@deprecated ${output.deprecated}`,
    ]),
    `  ${propertyName(output.name)}: ${type.text};${type.note ? ` // ${type.note}` : ''}`,
  ];
};

const typeBlock = (title: string, typeName: string, lines: string[]): string[] => {
  return [`## ${title}`, '', '```ts', `export type ${typeName} = {`, ...lines, '};', '```', ''];
};

const typeNames = (code: string): string[] => {
  return code.match(/\b[A-Z]\w*/g) ?? [];
};

const referencedTypes = ({typeSources, values}: ApiDescriptionInput, roots: string[]): string[] => {
  const declarations: string[] = [];
  const seen = new Set<string>();
  const queue: TypeReference[] = roots.flatMap(typeNames).map((name) => ({name, nested: false}));

  for (let next = queue.shift(); next && declarations.length < MAX_REFERENCED_TYPES; next = queue.shift()) {
    const {name, nested} = next;

    if (seen.has(name) || !typeSources.has(name)) {
      continue;
    }

    seen.add(name);

    const formatted = values.formatType(name);

    if (formatted.note !== null) {
      continue;
    }

    if (formatted.text !== name) {
      if (nested) {
        declarations.push(`export type ${name} = ${formatted.text};`);
      }

      continue;
    }

    const declaration = typeSources.declaration(name);

    if (declaration) {
      declarations.push(declaration);
      queue.push(...typeNames(declaration).map((nestedName) => ({name: nestedName, nested: true})));
    }
  }

  return declarations;
};

const usage = ({component, selectors, hostFallback}: ApiDescriptionInput): string | null => {
  const preferred = preferredSelector(selectors);

  if (!preferred) {
    return null;
  }

  const required = component.inputs.filter((input) => input.required).map((input) => input.name);
  const host = {
    ...preferred,
    attrs: preferred.attrs.map((attr) => ({...attr, value: attr.value || (required.includes(attr.name) ? '…' : '')})),
  };
  const extra = required
    .filter((name) => !preferred.attrs.some((attr) => attr.name === name))
    .map((name) => `${name}="…"`)
    .join(' ');

  return `**Usage:** \`${hostMarkup(host, hostFallback, extra)}\``;
};

export const buildApiDescription = (input: ApiDescriptionInput): string => {
  const {component, selectors, hostFallback, typeSources, importLine} = input;
  const typeParameters = typeSources.typeParameters(component.file, component.name) ?? '';
  const typeName = typeBaseName(component.name);
  const selector = describeSelector(selectors, hostFallback);
  const usageLine = usage(input);
  const types = referencedTypes(input, [
    typeParameters,
    ...component.inputs.map((item) => item.type),
    ...component.outputs.map((item) => item.type),
  ]);
  const parts: string[] = [];

  if (importLine) {
    parts.push(`**Import:** \`${importLine}\``, '');
  }

  if (selector) {
    parts.push(selector, '');
  }

  if (usageLine) {
    parts.push(usageLine, '');
  }

  if (component.formControl) {
    parts.push(FORM_CONTROL_NOTE, '');
  }

  if (component.inputs.length > 0) {
    parts.push(...typeBlock('Inputs', `${typeName}Inputs${typeParameters}`, component.inputs.flatMap((item) => inputLines(item, input))));
  }

  if (component.outputs.length > 0) {
    parts.push(...typeBlock('Outputs', `${typeName}Outputs${typeParameters}`, component.outputs.flatMap((item) => outputLines(item, input))));
  }

  if (types.length > 0) {
    parts.push('## Types', '', '```ts', types.join('\n\n'), '```', '');
  }

  return parts.join('\n').trim();
};
