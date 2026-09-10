import {provideZonelessChangeDetection} from '@angular/core';
import {type Preview, applicationConfig, componentWrapperDecorator} from '@storybook/angular';
import {provideAllNdwUiKitIcons} from '@ndw-ui-kit/core';
import {provideNdwUiKitNoopTranslation} from '@ndw-ui-kit/core/l10n';

type StorybookTheme = 'light' | 'dark';

function resolveTheme(theme: unknown): StorybookTheme {
  return theme === 'dark' ? 'dark' : 'light';
}

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        provideAllNdwUiKitIcons(),
        provideNdwUiKitNoopTranslation(),
      ],
    }),
    (storyFn, context) => {
      const theme = resolveTheme(context.globals['theme']);

      return componentWrapperDecorator(
        (story) => `<div class="ndwu-theme-${theme} storybook-surface">${story}</div>`,
      )(storyFn, context);
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      expanded: true,
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          {value: 'light', title: 'Light'},
          {value: 'dark', title: 'Dark'},
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
