import {setCompodocJson} from '@storybook/addon-docs/angular';
import {Preview, applicationConfig} from '@storybook/angular';
import {sizeGlobalType, sizeInitialGlobal, withSize, withSizeProviderImport} from './decorators/with-size.decorator';
import {withTheme} from './decorators/with-theme.decorator';
import docJson from './documentation.json';
import {STORYBOOK_PROVIDERS} from './providers';

setCompodocJson(docJson);

const preview: Preview = {
  decorators: [
    applicationConfig({providers: STORYBOOK_PROVIDERS}),
    withSizeProviderImport,
    withSize,
    withTheme,
  ],
  globalTypes: {
    ...sizeGlobalType,
  },
  initialGlobals: {
    ...sizeInitialGlobal,
    backgrounds: {value: 'surface'},
  },
  parameters: {
    options: {
      storySort: {
        order: ['Introduction', 'Foundations'],
      },
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      source: {
        excludeDecorators: true,
      },
    },
    a11y: {
      test: 'todo',
    },
    backgrounds: {
      options: {
        surface: {name: 'Surface', value: 'var(--ndwu-color-gray-0)'},
      },
    },
  },
};

export default preview;
