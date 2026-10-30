import {ChangeDetectorRef, Pipe, PipeTransform, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NdwuTranslationService} from './services/translation.service';

@Pipe({
  name: 'localize',
  pure: false,
})
export class NdwuLocalizePipe implements PipeTransform {
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

  public transform(key?: string, args?: Record<string, unknown>): string {
    if (!key) {
      return '';
    }

    return this.translationService.instant(key, args);
  }
}
