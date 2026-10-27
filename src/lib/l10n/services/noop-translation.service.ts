import {Injectable} from '@angular/core';
import {NEVER} from 'rxjs';
// Type-only import: `translation.service.ts` imports this file at runtime for its default factory.
import type {NdwuTranslationService} from './translation.service';

@Injectable()
export class NdwuNoopTranslationService implements NdwuTranslationService {
  public readonly onLangChange$ = NEVER;

  public instant(key: string, _?: Record<string, unknown>): string {
    return key;
  }
}
