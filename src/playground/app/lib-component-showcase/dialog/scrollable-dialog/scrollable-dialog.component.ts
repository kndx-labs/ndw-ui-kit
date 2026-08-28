import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {NDWU_MODAL_DATA} from '@ndw-ui-kit/core';
import {MarkdownDocumentPipe} from '@app/pipes/markdown-document.pipe';

@Component({
  selector: 'app-scrollable-dialog',
  templateUrl: './scrollable-dialog.component.html',
  styleUrl: './scrollable-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MarkdownDocumentPipe,
  ],
})
export class ScrollableDialogComponent {
  protected readonly sanitizer = inject(DomSanitizer);
  protected readonly markdownText = inject(NDWU_MODAL_DATA) as string;
}
