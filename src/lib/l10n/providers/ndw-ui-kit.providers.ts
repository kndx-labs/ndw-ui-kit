import {Provider} from '@angular/core';
import {NdwuNoopTranslationService, NdwuTranslationService} from '../services';

export function provideNdwuNoopTranslation(): Provider[] {
  return [
    {
      provide: NdwuTranslationService,
      useClass: NdwuNoopTranslationService,
    },
  ];
}
