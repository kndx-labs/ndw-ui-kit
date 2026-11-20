import {ArgTypes, moduleMetadata} from '@storybook/angular';
import {SbModalOpenerComponent} from './modal-opener.component';

export interface AfterClosedArg {
  afterClosed: (result: unknown) => void;
}

export const afterClosedArgType: ArgTypes[string] = {
  action: 'afterClosed',
  description:
    'Result of `afterClosed$`: the value passed to `close()`, a button `result`, or `undefined` after Escape, a backdrop click or the close button',
  table: {category: 'modal ref'},
};

export const withModalOpener = moduleMetadata({imports: [SbModalOpenerComponent]});

const INDENT = '  ';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const hasValue = ([, value]: [string, unknown]): boolean => {
  return value !== undefined && value !== '';
};

const quote = (value: string): string => {
  const escaped = value
    .replaceAll('\\', '\\\\')
    .replaceAll('\'', '\\\'')
    .replaceAll('\n', '\\n');

  return `'${escaped}'`;
};

const inlineSource = (value: unknown): string => {
  if (typeof value === 'string') {
    return quote(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(inlineSource).join(', ')}]`;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .filter(hasValue)
      .map(([key, item]) => `${key}: ${inlineSource(item)}`);

    return `{${entries.join(', ')}}`;
  }

  return String(value);
};

export const objectSource = (value: unknown, indent = 0): string => {
  const outer = INDENT.repeat(indent);
  const inner = INDENT.repeat(indent + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    return `[\n${value.map((item) => `${inner}${inlineSource(item)},\n`).join('')}${outer}]`;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(hasValue);

    if (entries.length === 0) {
      return '{}';
    }

    const body = entries
      .map(([key, item]) => {
        const source = Array.isArray(item) ? objectSource(item, indent + 1) : inlineSource(item);

        return `${inner}${key}: ${source},\n`;
      })
      .join('');

    return `{\n${body}${outer}}`;
  }

  return inlineSource(value);
};

export const modalSource = (method: string, config: object, content?: string): string => {
  const target = content === undefined ? '' : `${content}, `;

  return `this.modalService.${method}(${target}${objectSource(config)});`;
};

export const modalOpener = (label: string, open: string, template?: string): string => {
  const templateBinding = template === undefined ? '' : ` [template]="${template}"`;

  return `<sb-modal-opener label="${label}" [open]="${open}"${templateBinding} (closed)="afterClosed($event)" />`;
};

export const modalSources = (...items: string[]): string => {
  return items.join('\n\n');
};

export const modalStoryParameters = (code: string, story: string) => {
  return {
    controls: {disable: true},
    docs: {
      source: {code, language: 'ts'},
      description: {story},
    },
  };
};
