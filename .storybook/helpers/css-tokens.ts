import {ArgTypes} from '@storybook/angular';

type ArgType = ArgTypes[string];

type TokenControl = 'color' | 'text';

export const CSS_TOKEN_PREFIX = '--ndwu-';
export const CSS_TOKEN_NAME_PATTERN = /^--ndwu-/;

const CSS_TOKENS_CATEGORY = 'css tokens';
const CSS_TOKEN_DESCRIPTION = 'Empty: not overridden';

export type CssTokenArgs = Partial<Record<`${typeof CSS_TOKEN_PREFIX}${string}`, string>>;

export interface CssTokenGroup {
  readonly title: string;
  readonly keys: readonly string[];
  readonly textKeys?: readonly string[];
  readonly if?: ArgType['if'];
}

export const isCssTokenName = (name: string): boolean => {
  return name.startsWith(CSS_TOKEN_PREFIX);
};

const tokenArgType = (group: CssTokenGroup, control: TokenControl): ArgType => {
  return {
    control,
    description: CSS_TOKEN_DESCRIPTION,
    table: {category: CSS_TOKENS_CATEGORY, subcategory: group.title},
    ...(group.if ? {if: group.if} : {}),
  };
};

const tokenEntries = (group: CssTokenGroup, keys: readonly string[], control: TokenControl): [string, ArgType][] => {
  return keys.map((key): [string, ArgType] => [`${CSS_TOKEN_PREFIX}${key}`, tokenArgType(group, control)]);
};

export const cssTokenArgTypes = (groups: readonly CssTokenGroup[]): ArgTypes => {
  return Object.fromEntries(
    groups.flatMap((group) => [
      ...tokenEntries(group, group.keys, 'color'),
      ...tokenEntries(group, group.textKeys ?? [], 'text'),
    ]),
  );
};

export const withoutCssTokens = <TArgs extends object>(args: TArgs): TArgs => {
  return Object.fromEntries(Object.entries(args).filter(([name]) => !isCssTokenName(name))) as TArgs;
};
