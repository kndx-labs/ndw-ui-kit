export const CSS_TOKENS_ADDON_ID = 'ndwu-css-tokens';
export const CSS_TOKENS_PANEL_ID = 'ndwu-css-tokens/panel';
export const CSS_TOKENS_PARAM_KEY = 'cssTokens';

export const CSS_TOKENS_EVENT = {
  SET: 'ndwu-css-tokens/set',
  VALUES: 'ndwu-css-tokens/values',
} as const;

export type CssTokenCondition =
  | {readonly arg: string; readonly eq: unknown}
  | {readonly arg: string; readonly neq: unknown};

export interface CssTokenGroup {
  readonly title: string;
  readonly keys: readonly string[];
  readonly if?: CssTokenCondition;
}

export type CssTokenOverrides = Readonly<Record<string, string>>;

export type CssTokenOverridesByStory = Readonly<Record<string, CssTokenOverrides>>;

export interface CssTokenValue {
  readonly default?: string;
  readonly computed: string;
}

export type CssTokenValues = Readonly<Record<string, CssTokenValue>>;

export interface CssTokensSetPayload {
  readonly storyId: string;
  readonly overrides: CssTokenOverrides;
}

export interface CssTokensValuesPayload {
  readonly storyId: string;
  readonly tokens: CssTokenValues;
}

export interface CssTokensParameters {
  readonly cssTokens?: readonly CssTokenGroup[];
  readonly controls?: {readonly disable?: boolean};
}

export const EMPTY_OVERRIDES: CssTokenOverrides = {};

export const EMPTY_VALUES: CssTokenValues = {};

export const cssTokenName = (key: string): string => {
  return `--ndwu-${key}`;
};

export const groupTokenNames = (groups: readonly CssTokenGroup[]): string[] => {
  return groups.flatMap((group) => group.keys.map(cssTokenName));
};

export const isGroupActive = (group: CssTokenGroup, args: Readonly<Record<string, unknown>>): boolean => {
  const condition = group.if;

  if (!condition) {
    return true;
  }

  const value = args[condition.arg];

  return 'eq' in condition ? value === condition.eq : value !== condition.neq;
};

const withoutKey = <TValue>(record: Readonly<Record<string, TValue>>, key: string): Record<string, TValue> => {
  return Object.fromEntries(Object.entries(record).filter(([entryKey]) => entryKey !== key));
};

export const withoutStoryOverrides = (map: CssTokenOverridesByStory, storyId: string): CssTokenOverridesByStory => {
  return withoutKey(map, storyId);
};

export const withOverride = (
  map: CssTokenOverridesByStory,
  storyId: string,
  name: string,
  value: string | undefined,
): CssTokenOverridesByStory => {
  const rest = withoutKey(map[storyId] ?? EMPTY_OVERRIDES, name);
  const next = value === undefined || value.trim() === '' ? rest : {...rest, [name]: value};
  const others = withoutStoryOverrides(map, storyId);

  return Object.keys(next).length === 0 ? others : {...others, [storyId]: next};
};
