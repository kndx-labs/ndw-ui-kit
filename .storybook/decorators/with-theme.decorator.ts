import {DecoratorHelpers} from '@storybook/addon-themes';
import {Decorator} from '@storybook/angular';

type ThemeName = 'light' | 'dark';

const THEME_NAMES: readonly ThemeName[] = ['light', 'dark'];
const DEFAULT_THEME: ThemeName = 'light';

const THEME_CLASSES: Record<ThemeName, string> = {
  light: 'ndwu-theme-light',
  dark: 'ndwu-theme-dark',
};

const isThemeName = (value: unknown): value is ThemeName => {
  return THEME_NAMES.some((name) => name === value);
};

const applyBodyTheme = (themeName: ThemeName): void => {
  const classList = document.body.classList;

  THEME_NAMES.forEach((name) => classList.toggle(THEME_CLASSES[name], name === themeName));
};

DecoratorHelpers.initializeThemeState([...THEME_NAMES], DEFAULT_THEME);

export const withTheme: Decorator = (storyFn, context) => {
  const selected = DecoratorHelpers.pluckThemeFromContext(context);

  applyBodyTheme(isThemeName(selected) ? selected : DEFAULT_THEME);

  return storyFn();
};
