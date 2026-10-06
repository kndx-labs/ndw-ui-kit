import {NgTemplateOutlet} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  TemplateRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  NDWU_TOOLTIP_CONTENT,
  NDWU_TOOLTIP_CONTEXT,
  NDWU_TOOLTIP_ID,
  NDWU_TOOLTIP_LIVE,
  NDWU_TOOLTIP_MAX_WIDTH,
  type NdwuTooltipTemplateContext,
} from './ndwu-tooltip.tokens';

@Component({
  selector: 'ndwu-tooltip',
  templateUrl: './ndwu-tooltip.component.html',
  styleUrl: './ndwu-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class NdwuTooltipComponent {
  protected readonly tooltipId = inject(NDWU_TOOLTIP_ID);
  protected readonly content = inject(NDWU_TOOLTIP_CONTENT);
  protected readonly maxWidth = inject(NDWU_TOOLTIP_MAX_WIDTH, {optional: true});
  protected readonly isLive = inject(NDWU_TOOLTIP_LIVE, {optional: true}) ?? signal(true);

  private readonly context = inject(NDWU_TOOLTIP_CONTEXT, {optional: true});
  private readonly destroyRef = inject(DestroyRef);

  protected readonly template = this.content instanceof TemplateRef ? this.content : null;
  protected readonly templateContext = computed<NdwuTooltipTemplateContext>(() => {
    return {$implicit: this.context?.()};
  });

  private readonly contentBox = viewChild<ElementRef<HTMLElement>>('contentBox');

  protected readonly isMultiline = signal(false);

  constructor() {
    afterNextRender({
      read: () => {
        this.isMultiline.set(this.measureIsMultiline());

        if (this.template) {
          this.observeTemplateResize();
        }
      },
    });
  }

  private measureIsMultiline(): boolean {
    const box = this.contentBox()?.nativeElement;

    if (!box) {
      return false;
    }

    // An inline element renders one line box per wrapped line, so more than one means it wrapped.
    if (!this.template) {
      return box.getClientRects().length > 1;
    }

    // Template content may be block-level, so compare the box height against a single line instead.
    const lineHeight = parseFloat(getComputedStyle(box).lineHeight);

    return Number.isFinite(lineHeight) && box.offsetHeight > lineHeight * 1.5;
  }

  /**
   * Template content changes with its context (e.g. the tooltip moves to another target),
   * so the multiline state is re-measured whenever the content box resizes.
   * Safe from feedback: the multiline modifier changes only the wrapper's block padding.
   */
  private observeTemplateResize(): void {
    const box = this.contentBox()?.nativeElement;

    if (!box) {
      return;
    }

    const observer = new ResizeObserver(() => this.isMultiline.set(this.measureIsMultiline()));

    observer.observe(box);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
