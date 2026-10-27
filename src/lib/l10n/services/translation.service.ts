import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {NdwuNoopTranslationService} from './noop-translation.service';

// Falls back to `NdwuNoopTranslationService` when the app provides no translation service.
@Injectable({
  providedIn: 'root',
  useFactory: () => {
    return new NdwuNoopTranslationService();
  },
})
export abstract class NdwuTranslationService {
  // stream that emits when language/translations change.
  public abstract onLangChange$: Observable<unknown>;

  public abstract instant(key: string, params?: Record<string, unknown>): string;
}
