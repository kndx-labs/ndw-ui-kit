import type {StorybookConfig} from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../src/storybook/**/*.mdx',
    '../src/storybook/**/*.stories.ts',
    '../src/lib/**/*.stories.ts',
  ],
  addons: [
    './addons/angular-manifest/preset.ts',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  staticDirs: [
    {from: '../src/lib/assets', to: '/assets'},
    {from: '../src/storybook/assets', to: '/sb-assets'},
  ],
  core: {
    disableTelemetry: true,
  },
  features: {
    angularFilterNonInputControls: true,
    componentsManifest: true,
  },
};

export default config;
