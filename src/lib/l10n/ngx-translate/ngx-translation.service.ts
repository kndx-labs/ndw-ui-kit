import {Injectable} from '@angular/core';
import {InterpolationParameters, TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {UiKitTranslationService} from '@ndw-ui-kit/core/l10n';

@Injectable()
export class NgxTranslationService extends UiKitTranslationService {
  constructor(
    private translate: TranslateService,
  ) {
    super();
  }

  public get onLangChange$(): Observable<unknown> {
    return this.translate.onLangChange;
  }

  public instant(key: string, params?: InterpolationParameters): string {
    return String(this.translate.instant(key, params));
  }
}
