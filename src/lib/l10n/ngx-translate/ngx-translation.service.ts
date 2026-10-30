import {Injectable, inject} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {NdwuTranslationService} from '@ndw-ui-kit/core/l10n';

@Injectable()
export class NdwuNgxTranslationService extends NdwuTranslationService {
  private readonly translate = inject(TranslateService);

  public get onLangChange$(): Observable<unknown> {
    return this.translate.onTranslationRefresh;
  }

  public instant(key: string, params?: Record<string, unknown>): string {
    return String(this.translate.instant(key, params));
  }
}
