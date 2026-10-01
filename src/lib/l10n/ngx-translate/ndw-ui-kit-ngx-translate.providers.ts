import {Provider} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {UiKitTranslationService} from '@ndw-ui-kit/core/l10n';
import {NgxTranslationService} from './ngx-translation.service';

export function provideNdwUiKitNgxTranslate(): Provider[] {
  return [
    {
      provide: UiKitTranslationService,
      useClass: NgxTranslationService,
      deps: [TranslateService],
    },
  ];
}
