import {ArgTypes} from '@storybook/angular';

type ArgType = ArgTypes[string];

const CSS_TOKEN_PREFIX = '--ndwu-';

export const CSS_TOKEN_NAME_PATTERN = new RegExp(`^${CSS_TOKEN_PREFIX}`);

const CSS_TOKENS_CATEGORY = 'css tokens';
const CSS_TOKEN_DESCRIPTION = 'Empty: not overridden';
const CSS_TOKEN_STYLE_ELEMENT_ID = 'sb-css-tokens';
const ROOT_SELECTOR = ':root';

export type CssTokenArgs = Partial<Record<`${typeof CSS_TOKEN_PREFIX}${string}`, string>>;

export interface CssTokenGroup {
  readonly title: string;
  readonly keys: readonly string[];
  readonly if?: ArgType['if'];
}

export const isCssTokenName = (name: string): boolean => {
  return name.startsWith(CSS_TOKEN_PREFIX);
};

const sheetRules = (sheet: CSSStyleSheet): CSSRule[] => {
  try {
    return Array.from(sheet.cssRules);
  } catch {
    return [];
  }
};

const isRootRule = (rule: CSSRule): rule is CSSStyleRule => {
  return rule instanceof CSSStyleRule
    && rule.selectorText.split(',').some((selector) => selector.trim() === ROOT_SELECTOR);
};

const tokenDefault = (name: string): string | undefined => {
  return Array.from(document.styleSheets)
    .filter((sheet) => !(sheet.ownerNode instanceof Element && sheet.ownerNode.id === CSS_TOKEN_STYLE_ELEMENT_ID))
    .flatMap(sheetRules)
    .filter(isRootRule)
    .map((rule) => rule.style.getPropertyValue(name).trim())
    .filter((value) => value !== '')
    .at(-1);
};

const tokenArgType = (group: CssTokenGroup, name: string): ArgType => {
  const defaultValue = tokenDefault(name);

  return {
    control: 'text',
    description: CSS_TOKEN_DESCRIPTION,
    table: {
      category: CSS_TOKENS_CATEGORY,
      subcategory: group.title,
      ...(defaultValue ? {defaultValue: {summary: defaultValue}} : {}),
    },
    ...(group.if ? {if: group.if} : {}),
  };
};

const tokenEntries = (group: CssTokenGroup): [string, ArgType][] => {
  return group.keys.map((key): [string, ArgType] => {
    const name = `${CSS_TOKEN_PREFIX}${key}`;

    return [name, tokenArgType(group, name)];
  });
};

export const cssTokenArgTypes = (groups: readonly CssTokenGroup[]): ArgTypes => {
  return Object.fromEntries(groups.flatMap(tokenEntries));
};

export const withoutCssTokens = <TArgs extends object>(args: TArgs): TArgs => {
  return Object.fromEntries(Object.entries(args).filter(([name]) => !isCssTokenName(name))) as TArgs;
};
