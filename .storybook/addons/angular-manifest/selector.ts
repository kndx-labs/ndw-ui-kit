import {CssSelector} from '@angular/compiler';

export interface HostSelector {
  element: string | null;
  attrs: {name: string; value: string}[];
  classNames: string[];
}

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

const toHostSelector = (selector: CssSelector): HostSelector => {
  const attrs: HostSelector['attrs'] = [];

  for (let index = 0; index < selector.attrs.length; index += 2) {
    attrs.push({name: selector.attrs[index] ?? '', value: selector.attrs[index + 1] ?? ''});
  }

  return {element: selector.element, attrs, classNames: selector.classNames};
};

export const parseSelectors = (selector: string): HostSelector[] => {
  return selector ? CssSelector.parse(selector).map(toHostSelector) : [];
};

export const formatSelector = (selector: HostSelector): string => {
  const attrs = selector.attrs.map(({name, value}) => (value ? `[${name}=${value}]` : `[${name}]`)).join('');
  const classes = selector.classNames.map((name) => `.${name}`).join('');

  return `${selector.element ?? ''}${attrs}${classes}`;
};

export const preferredSelector = (selectors: HostSelector[]): HostSelector | null => {
  const first = selectors[0];

  if (!first) {
    return null;
  }

  const kebab = selectors.find((selector) => selector.attrs[0]?.name.includes('-'));

  return kebab?.element === first.element && first.attrs.length > 0 ? kebab : first;
};

export const hostElement = (selector: HostSelector, fallback: string): string => {
  return selector.element && selector.element !== '*' ? selector.element : fallback;
};

export const hostMarkup = (selector: HostSelector, fallback: string, extra = ''): string => {
  const element = hostElement(selector, fallback);
  const attrs = selector.attrs.map(({name, value}) => (value ? ` ${name}="${value}"` : ` ${name}`)).join('');
  const classes = selector.classNames.length > 0 ? ` class="${selector.classNames.join(' ')}"` : '';
  const open = `<${element}${attrs}${classes}${extra ? ` ${extra}` : ''}`;

  return VOID_ELEMENTS.has(element) ? `${open} />` : `${open}></${element}>`;
};

export const describeSelector = (selectors: HostSelector[], fallback: string): string => {
  const preferred = preferredSelector(selectors);

  if (!preferred) {
    return '';
  }

  const all = selectors.map((selector) => `\`${formatSelector(selector)}\``).join(', ');
  const attr = preferred.attrs[0]?.name;
  const example = hostMarkup(preferred, fallback, '…');

  if (!preferred.element && attr) {
    return `**Selector:** ${all} — attribute directive, put on any element: \`${example}\`.`;
  }

  if (preferred.element && attr) {
    return [
      `**Selector:** ${all} — attribute selector on a native \`<${preferred.element}>\`.`,
      `Use \`${example}\`. \`<${attr}>\` is not a component and fails with NG0304.`,
    ].join('\n');
  }

  return `**Selector:** ${all} — element selector: \`${example}\`.`;
};
