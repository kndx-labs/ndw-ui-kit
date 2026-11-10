import {setCompodocJson} from '@storybook/addon-docs/angular';
import {Preview, applicationConfig} from '@storybook/angular';
import {sizeGlobalType, sizeInitialGlobal, withSize, withSizeProviderImport} from './decorators/with-size.decorator';
import {withTheme} from './decorators/with-theme.decorator';
import {withCssTokens} from './decorators/with-css-tokens.decorator';
import docJson from './documentation.json';
import {STORYBOOK_PROVIDERS} from './providers';
import {CSS_TOKEN_NAME_PATTERN} from './helpers/css-tokens';

setCompodocJson(docJson);

const preview: Preview = {
  decorators: [
    applicationConfig({providers: STORYBOOK_PROVIDERS}),
    withSizeProviderImport,
    withSize,
    withCssTokens,
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
        order: ['Introduction'],
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
      controls: {
        exclude: CSS_TOKEN_NAME_PATTERN,
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
