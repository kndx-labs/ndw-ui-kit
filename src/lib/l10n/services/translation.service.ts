import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export abstract class NdwuTranslationService {
  // stream that emits when language/translations change.
  public abstract onLangChange$: Observable<any>;

  public abstract instant(key: string, params?: any): string;
}
