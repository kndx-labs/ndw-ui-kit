import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {NdwuLocalizeHtmlPipe} from '@ndw-ui-kit/core/l10n';
import {NDWU_TOOLTIP_CONTENT, NDWU_TOOLTIP_ID, NDWU_TOOLTIP_MAX_WIDTH} from './ndwu-tooltip.tokens';

@Component({
  selector: 'ndwu-tooltip',
  templateUrl: './ndwu-tooltip.component.html',
  styleUrl: './ndwu-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuLocalizeHtmlPipe],
})
export class NdwuTooltipComponent {
  protected readonly tooltipId = inject(NDWU_TOOLTIP_ID);
  protected readonly content = inject(NDWU_TOOLTIP_CONTENT);
  protected readonly maxWidth = inject(NDWU_TOOLTIP_MAX_WIDTH, {optional: true});

  private readonly contentBox = viewChild<ElementRef<HTMLElement>>('contentBox');

  protected readonly isMultiline = signal(false);

  constructor() {
    afterNextRender({read: () => this.isMultiline.set(this.measureIsMultiline())});
  }

  /** An inline element renders one line box per wrapped line, so more than one means it wrapped. */
  private measureIsMultiline(): boolean {
    return (this.contentBox()?.nativeElement.getClientRects().length ?? 0) > 1;
  }
}
