import {provideHttpClient} from '@angular/common/http';
import {EnvironmentProviders, Provider} from '@angular/core';
import {provideNdwuAllIcons} from '@ndw-ui-kit/core';

export const STORYBOOK_PROVIDERS: (Provider | EnvironmentProviders)[] = [
  provideHttpClient(),
  provideNdwuAllIcons(),
];
