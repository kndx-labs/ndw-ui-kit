import {ChangeDetectorRef, Pipe, PipeTransform, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DomSanitizer, type SafeHtml} from '@angular/platform-browser';
import {NdwuTranslationService} from './services/translation.service';

export type NdwuLocalizableHtml = string | SafeHtml;

@Pipe({
  name: 'localizeHtml',
  pure: false,
})
export class NdwuLocalizeHtmlPipe implements PipeTransform {
  private readonly translationService = inject(NdwuTranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sanitizer = inject(DomSanitizer);

  private cache: {html: string; trusted: SafeHtml} | null = null;

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

    const html = this.translationService.instant(key, args);

    if (html === key) {
      return key;
    }

    if (this.cache?.html !== html) {
      this.cache = {html, trusted: this.sanitizer.bypassSecurityTrustHtml(html)};
    }

    return this.cache.trusted;
  }
}
