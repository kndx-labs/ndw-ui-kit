import {Provider} from '@angular/core';
import {NoopTranslationService, UiKitTranslationService} from '../services';

export function provideNdwUiKitNoopTranslation(): Provider[] {
  return [
    {
      provide: UiKitTranslationService,
      useClass: NoopTranslationService,
    },
  ];
}
