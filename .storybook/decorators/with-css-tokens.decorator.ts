import {Args, Decorator} from '@storybook/angular';
import {isCssTokenName} from '../helpers/css-tokens';

type TokenOverride = [name: string, value: string];

const STYLE_ELEMENT_ID = 'sb-css-tokens';
const TOKEN_SELECTOR = ':root, .ndwu-theme-light, .ndwu-theme-dark';

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

const clearCssTokens = (style: CSSStyleDeclaration): void => {
  Array.from(style)
    .filter(isCssTokenName)
    .forEach((name) => style.removeProperty(name));
};

const cssTokenOverrides = (args: Args): TokenOverride[] => {
  return Object.entries(args)
    .filter((entry): entry is TokenOverride => isCssTokenName(entry[0]) && typeof entry[1] === 'string')
    .map(([name, value]): TokenOverride => [name, value.trim()])
    .filter(([, value]) => value !== '');
};

export const withCssTokens: Decorator = (storyFn, context) => {
  const style = tokenRuleStyle();

  if (style) {
    clearCssTokens(style);

    if (context.viewMode !== 'docs') {
      cssTokenOverrides(context.args).forEach(([name, value]) => style.setProperty(name, value, 'important'));
    }
  }

  return storyFn();
};
