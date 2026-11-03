import type {StorybookConfig} from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/lib/**/*.stories.ts'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  staticDirs: [{from: '../src/lib/assets', to: '/assets'}],
  core: {
    disableTelemetry: true,
  },
  features: {
    angularFilterNonInputControls: true,
  },
};

export default config;
