import type {Globals} from 'storybook/internal/types';
import {type ThemeVars, create} from 'storybook/theming';

const BRAND = {
  brandTitle: 'NDW UI Kit',
  colorSecondary: '#007bbe',
};

const STORYBOOK_THEMES: Record<'light' | 'dark', ThemeVars> = {
  light: create({base: 'light', ...BRAND, brandImage: 'sb-assets/logo.svg'}),
  dark: create({base: 'dark', ...BRAND, brandImage: 'sb-assets/logo-dark.svg'}),
};

export const storybookTheme = (globals: Globals | undefined): ThemeVars => {
  return globals?.['theme'] === 'dark' ? STORYBOOK_THEMES.dark : STORYBOOK_THEMES.light;
};
