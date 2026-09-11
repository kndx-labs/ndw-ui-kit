import type {StorybookConfig} from '@storybook/angular';

const config: StorybookConfig = {
  framework: '@storybook/angular',
  stories: ['../**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  staticDirs: [
    {from: '../../lib/assets', to: '/assets'},
    {from: '../../playground/assets/i18n', to: '/assets/i18n'},
  ],
  core: {disableTelemetry: true},
};

export default config;
