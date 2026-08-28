import {ChangeDetectorRef, Pipe, PipeTransform} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UiKitTranslationService} from './services/translation.service';

@Pipe({
  name: 'localize',
  pure: false,
})
export class LocalizePipe implements PipeTransform {
  constructor(
    private translationService: UiKitTranslationService,
    private cdr: ChangeDetectorRef,
  ) {
    this.translationService.onLangChange$
      .pipe(
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  public transform(key?: string, args?: any): string {
    if (!key) {
      return '';
    }

    return this.translationService.instant(key, args);
  }
}
