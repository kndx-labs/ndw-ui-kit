import {ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {provideNdwuAllIcons} from '@ndw-ui-kit/core';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    provideNdwuAllIcons(),
  ],
};
