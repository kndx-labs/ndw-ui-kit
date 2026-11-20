import {addons} from 'storybook/manager-api';
import {create} from 'storybook/theming';
import './addons/css-tokens/register';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'NDW UI Kit',
    brandImage: 'sb-assets/logo.svg',
    colorSecondary: '#007bbe',
  }),
});
