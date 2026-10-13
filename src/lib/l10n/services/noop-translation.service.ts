import {Injectable} from '@angular/core';
import {NEVER} from 'rxjs';
import {NdwuTranslationService} from './translation.service';

@Injectable()
export class NdwuNoopTranslationService implements NdwuTranslationService {
  public readonly onLangChange$ = NEVER;

  public instant(key: string, _?: any): string {
    return key;
  }
}
