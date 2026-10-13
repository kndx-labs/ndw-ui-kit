import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {OverlayModule} from '@angular/cdk/overlay';
import {TranslateService, provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {firstValueFrom} from 'rxjs';
import {provideNdwuNgxTranslate} from '@ndw-ui-kit/core/l10n/ngx-translate';
import {provideNdwuAllIcons} from '@ndw-ui-kit/core';
import {routes} from './app.routes';

function initializeApp(): Promise<unknown> {
  const translate = inject(TranslateService);

  translate.addLangs(['en', 'de']);
  translate.setFallbackLang('en').subscribe();

  return firstValueFrom(translate.use('en'));
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    importProvidersFrom(OverlayModule),
    provideRouter(routes, withComponentInputBinding()),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
    }),
    provideAppInitializer(initializeApp),
    provideNdwuNgxTranslate(),
    provideNdwuAllIcons(),
  ],
};
