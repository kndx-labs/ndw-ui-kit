import {addons} from 'storybook/preview-api';
import {
  CSS_TOKENS_EVENT,
  type CssTokenGroup,
  type CssTokenValue,
  type CssTokensSetPayload,
  type CssTokensValuesPayload,
  groupTokenNames,
  isGroupActive,
} from './shared';

export interface RenderedCssTokensStory {
  readonly storyId: string;
  readonly groups: readonly CssTokenGroup[];
  readonly args: Readonly<Record<string, unknown>>;
  readonly viewMode: string;
}

type SetHandler = (payload: CssTokensSetPayload) => void;

const STYLE_ELEMENT_ID = 'sb-css-tokens';
const TOKEN_SELECTOR = ':root, .ndwu-theme-light, .ndwu-theme-dark';
const ROOT_SELECTOR = ':root';
const SET_HANDLER_KEY = Symbol.for('ndwu-css-tokens/set-handler');

let lastSet: CssTokensSetPayload | null = null;
let rendered: RenderedCssTokensStory | null = null;

const tokenStyleElement = (): HTMLStyleElement => {
  const existing = document.getElementById(STYLE_ELEMENT_ID);

  if (existing instanceof HTMLStyleElement) {
    return existing;
  }

  const element = document.createElement('style');

  element.id = STYLE_ELEMENT_ID;
  element.textContent = `${TOKEN_SELECTOR} {}`;
  document.head.append(element);

  return element;
};

const tokenRuleStyle = (): CSSStyleDeclaration | null => {
  const rule = tokenStyleElement().sheet?.cssRules[0];

  return rule instanceof CSSStyleRule ? rule.style : null;
};

const clearRule = (style: CSSStyleDeclaration): void => {
  Array.from(style).forEach((name) => style.removeProperty(name));
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

const rootRules = (): CSSStyleRule[] => {
  return Array.from(document.styleSheets)
    .filter((sheet) => !(sheet.ownerNode instanceof Element && sheet.ownerNode.id === STYLE_ELEMENT_ID))
    .flatMap(sheetRules)
    .filter(isRootRule);
};

const tokenDefault = (rules: readonly CSSStyleRule[], name: string): string | undefined => {
  return rules
    .map((rule) => rule.style.getPropertyValue(name).trim())
    .filter((value) => value !== '')
    .at(-1);
};

const tokenValue = (rules: readonly CSSStyleRule[], computed: CSSStyleDeclaration, name: string): CssTokenValue => {
  const defaultValue = tokenDefault(rules, name);

  return {
    ...(defaultValue === undefined ? {} : {default: defaultValue}),
    computed: computed.getPropertyValue(name).trim(),
  };
};

const applyOverrides = (style: CSSStyleDeclaration, story: RenderedCssTokensStory): void => {
  const set = lastSet;

  if (set?.storyId !== story.storyId) {
    return;
  }

  groupTokenNames(story.groups.filter((group) => isGroupActive(group, story.args))).forEach((name) => {
    const value = set.overrides[name]?.trim();

    if (value) {
      style.setProperty(name, value, 'important');
    }
  });
};

const reportValues = (story: RenderedCssTokensStory): void => {
  const rules = rootRules();
  const computed = getComputedStyle(document.body);
  const tokens = Object.fromEntries(
    groupTokenNames(story.groups).map((name) => [name, tokenValue(rules, computed, name)]),
  );
  const payload: CssTokensValuesPayload = {storyId: story.storyId, tokens};

  addons.getChannel().emit(CSS_TOKENS_EVENT.VALUES, payload);
};

const applyCssTokens = (): void => {
  const style = tokenRuleStyle();
  const story = rendered;

  if (!style) {
    return;
  }

  clearRule(style);

  if (!story || story.viewMode === 'docs' || story.groups.length === 0) {
    return;
  }

  applyOverrides(style, story);
  reportValues(story);
};

const registerSetHandler = (): void => {
  const slot = globalThis as unknown as Record<symbol, SetHandler | undefined>;
  const channel = addons.getChannel();
  const previous = slot[SET_HANDLER_KEY];
  const handler: SetHandler = (payload) => {
    lastSet = payload;
    applyCssTokens();
  };

  if (previous) {
    channel.off(CSS_TOKENS_EVENT.SET, previous);
  }

  channel.on(CSS_TOKENS_EVENT.SET, handler);
  slot[SET_HANDLER_KEY] = handler;
};

registerSetHandler();

export const setRenderedStory = (story: RenderedCssTokensStory): void => {
  rendered = story;
  applyCssTokens();
};
