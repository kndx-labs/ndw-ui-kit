import {Provider} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NdwuTranslationService} from '@ndw-ui-kit/core/l10n';
import {NdwuNgxTranslationService} from './ngx-translation.service';

export function provideNdwuNgxTranslate(): Provider[] {
  return [
    {
      provide: NdwuTranslationService,
      useClass: NdwuNgxTranslationService,
      deps: [TranslateService],
    },
  ];
}
