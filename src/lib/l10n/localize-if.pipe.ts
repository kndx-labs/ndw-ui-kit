import {ChangeDetectorRef, Pipe, type PipeTransform, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NdwuTranslationService} from './services/translation.service';

@Pipe({
  name: 'localizeIf',
  pure: false,
})
export class NdwuLocalizeIfPipe implements PipeTransform {
  private readonly translationService = inject(NdwuTranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.translationService.onLangChange$
      .pipe(
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  public transform(key: string | undefined, shouldLocalize: boolean, args?: Record<string, unknown>): string {
    if (!key) {
      return '';
    }

    if (!shouldLocalize) {
      return key;
    }

    return this.translationService.instant(key, args);
  }
}
