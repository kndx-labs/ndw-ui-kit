import {Provider} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NgxTranslationService, UiKitTranslationService} from '../services';

export function provideNdwUiKitNgxTranslate(): Provider[] {
  return [
    {
      provide: UiKitTranslationService,
      useClass: NgxTranslationService,
      deps: [TranslateService],
    },
  ];
}
