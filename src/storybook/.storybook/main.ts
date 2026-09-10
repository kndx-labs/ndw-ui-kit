import type {StorybookConfig} from '@storybook/angular';

const config: StorybookConfig = {
  framework: '@storybook/angular',
  stories: ['../**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  staticDirs: [{from: '../../lib/assets', to: '/assets'}],
  core: {disableTelemetry: true},
};

export default config;
