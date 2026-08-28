import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {marked} from 'marked';

@Pipe({
  name: 'parseMarkdownDocument',
})
export class MarkdownDocumentPipe implements PipeTransform {
  constructor(
    private sanitizer: DomSanitizer,
  ) {
  }

  public transform(text: string): any {
    return this.sanitize(this.processMarkdown(text));
  }

  private sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private processMarkdown(text: string): string {
    return marked.parse(
      text,
      {
        async: false,
        gfm: true,
      },
    );
  }
}
