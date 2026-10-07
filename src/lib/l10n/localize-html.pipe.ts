import {ChangeDetectorRef, Pipe, PipeTransform, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import type {SafeHtml} from '@angular/platform-browser';
import {UiKitTranslationService} from './services/translation.service';

export type NdwuLocalizableHtml = string | SafeHtml;

@Pipe({
  name: 'localizeHtml',
  pure: false,
})
export class LocalizeHtmlPipe implements PipeTransform {
  private readonly translationService = inject(UiKitTranslationService);
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

  public transform(key?: NdwuLocalizableHtml, args?: Record<string, unknown>): NdwuLocalizableHtml {
    if (!key) {
      return '';
    }

    if (typeof key !== 'string') {
      return key;
    }

    return this.translationService.instant(key, args);
  }
}
