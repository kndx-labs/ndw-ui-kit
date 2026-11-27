import {CompodocClass, CompodocMember, CompodocValues, literal} from './compodoc.js';
import {HostSelector, describeSelector, hostMarkup, preferredSelector} from './selector.js';
import {readPath} from './snippet.js';
import {Unresolvable} from './static-eval.js';

export interface ApiDescriptionInput {
  component: CompodocClass;
  selectors: HostSelector[];
  hostFallback: string;
  values: CompodocValues;
  argTypes: unknown;
}

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
  const {component, selectors, hostFallback} = input;
  const typeName = typeBaseName(component.name);
  const selector = describeSelector(selectors, hostFallback);
  const usageLine = usage(input);
  const parts: string[] = [];

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
    parts.push(...typeBlock('Inputs', `${typeName}Inputs`, component.inputs.flatMap((item) => inputLines(item, input))));
  }

  if (component.outputs.length > 0) {
    parts.push(...typeBlock('Outputs', `${typeName}Outputs`, component.outputs.flatMap((item) => outputLines(item, input))));
  }

  return parts.join('\n').trim();
};
