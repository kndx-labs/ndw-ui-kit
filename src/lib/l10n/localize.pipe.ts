import {ChangeDetectorRef, Pipe, PipeTransform} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NdwuTranslationService} from './services/translation.service';

@Pipe({
  name: 'localize',
  pure: false,
})
export class NdwuLocalizePipe implements PipeTransform {
  constructor(
    private translationService: NdwuTranslationService,
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
