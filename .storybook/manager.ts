import {GLOBALS_UPDATED, SET_GLOBALS} from 'storybook/internal/core-events';
import type {Globals} from 'storybook/internal/types';
import {addons} from 'storybook/manager-api';
import './addons/css-tokens/register';
import {storybookTheme} from './theming/storybook-themes';

addons.setConfig({
  theme: storybookTheme(undefined),
});

addons.register('ndwu/storybook-theme', (api) => {
  const sync = ({globals}: {globals: Globals}): void => api.setOptions({theme: storybookTheme(globals)});

  api.on(SET_GLOBALS, sync);
  api.on(GLOBALS_UPDATED, sync);
});
