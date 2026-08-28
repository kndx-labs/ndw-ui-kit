import {ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {provideAllNdwUiKitIcons} from '@ndw-ui-kit/core';
import {provideNdwUiKitNoopTranslation} from '@ndw-ui-kit/core/l10n';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    provideNdwUiKitNoopTranslation(),
    provideAllNdwUiKitIcons(),
  ],
};
