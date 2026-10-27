import {Provider} from '@angular/core';
import {NdwuNoopTranslationService, NdwuTranslationService} from '../services';

/**
 * Optional: `NdwuTranslationService` falls back to `NdwuNoopTranslationService` by default.
 * Use it to replace another translation service in a child injector.
 */
export function provideNdwuNoopTranslation(): Provider[] {
  return [
    {
      provide: NdwuTranslationService,
      useClass: NdwuNoopTranslationService,
    },
  ];
}
