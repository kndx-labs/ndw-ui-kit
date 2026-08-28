import {Injectable} from '@angular/core';
import {NEVER} from 'rxjs';
import {UiKitTranslationService} from './translation.service';

@Injectable()
export class NoopTranslationService implements UiKitTranslationService {
  public readonly onLangChange$ = NEVER;

  public instant(key: string, _?: any): string {
    return key;
  }
}
