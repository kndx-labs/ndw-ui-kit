import {Injectable} from '@angular/core';
import {InterpolationParameters, TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {NdwuTranslationService} from '@ndw-ui-kit/core/l10n';

@Injectable()
export class NdwuNgxTranslationService extends NdwuTranslationService {
  constructor(
    private translate: TranslateService,
  ) {
    super();
  }

  public get onLangChange$(): Observable<unknown> {
    return this.translate.onTranslationRefresh;
  }

  public instant(key: string, params?: InterpolationParameters): string {
    return String(this.translate.instant(key, params));
  }
}
