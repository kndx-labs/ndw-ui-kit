import {Component, effect, inject, input, provideZonelessChangeDetection} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {type Preview, applicationConfig, componentWrapperDecorator, moduleMetadata} from '@storybook/angular';
import {TranslateService, provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {provideAllNdwUiKitIcons} from '@ndw-ui-kit/core';
import {provideNdwUiKitNgxTranslate} from '@ndw-ui-kit/core/l10n';

type StorybookTheme = 'light' | 'dark';
type StorybookLang = 'en' | 'de';

function resolveTheme(theme: unknown): StorybookTheme {
  return theme === 'dark' ? 'dark' : 'light';
}

function resolveLang(lang: unknown): StorybookLang {
  return lang === 'de' ? 'de' : 'en';
}

@Component({
  selector: 'storybook-locale-setter',
  template: '',
  standalone: true,
})
class LocaleSetterComponent {
  readonly lang = input<StorybookLang>('en');
  private readonly translate = inject(TranslateService);

  constructor() {
    effect(() => {
      this.translate.use(this.lang());
    });
  }
}

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideAllNdwUiKitIcons(),
        provideTranslateService({
          fallbackLang: 'en',
          loader: provideTranslateHttpLoader({
            prefix: './assets/i18n/',
            suffix: '.json',
          }),
        }),
        provideNdwUiKitNgxTranslate(),
      ],
    }),
    moduleMetadata({imports: [LocaleSetterComponent]}),
    (storyFn, context) => {
      const theme = resolveTheme(context.globals['theme']);
      const lang = resolveLang(context.globals['locale']);

      return componentWrapperDecorator(
        (story) => {
          return `
            <storybook-locale-setter [lang]="'${lang}'"></storybook-locale-setter>
            <div class="ndwu-theme-${theme} storybook-surface">${story}</div>
          `;
        },
      )(storyFn, context);
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      expanded: true,
    },
    viewport: {
      viewports: {
        mobile: {name: 'Mobile', styles: {width: '375px', height: '667px'}},
        tablet: {name: 'Tablet', styles: {width: '768px', height: '1024px'}},
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    locale: 'en',
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
    locale: {
      description: 'Locale for translations',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          {value: 'en', title: 'English'},
          {value: 'de', title: 'Deutsch'},
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
