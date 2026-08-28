/* eslint id-blacklist: 0 */
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {SIZE, Size} from '../../../shared.types';
import {
  type AxisConfigEntry,
  type AxisElements,
  type AxisMetrics,
  type DragState,
  type NdwuScrollbarPadding,
  type ScrollbarAxis,
} from './ndwu-scrollbar.types';

// should match --ndwu-scrollbar-min-thumb-size
const MIN_THUMB_SIZE = 24;

// only mouse pointers receive custom track/thumb interaction. Touch/pen fall back to native scroll.
const SUPPORTED_POINTER_TYPE = 'mouse';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[ndwuScrollbar]',
  exportAs: 'ndwuScrollbar',
  templateUrl: './ndwu-scrollbar.component.html',
  styleUrl: './ndwu-scrollbar.scss',
  host: {
    '[class.ndwu-scrollbar--size-l]': 'normalizedSize() === "L"',
    '[class.ndwu-scrollbar--size-xl]': 'normalizedSize() === "XL"',
    '[class.ndwu-scrollbar--scrollable-y]': 'isOverflowingY()',
    '[class.ndwu-scrollbar--scrollable-x]': 'isOverflowingX()',
    '[class.ndwu-scrollbar--dragging]': 'isDragging()',
    '[class.ndwu-scrollbar--axis-y]': 'ndwuScrollbarAxis() === "y"',
    '[class.ndwu-scrollbar--axis-x]': 'ndwuScrollbarAxis() === "x"',
    '[class.ndwu-scrollbar--axis-both]': 'ndwuScrollbarAxis() === "both"',
    '[class.ndwu-scrollbar--unprintable]': '!ndwuScrollbarPrintable()',
    '[class.ndwu-scrollbar--disabled]': 'ndwuScrollbarDisabled()',
    '[style.--ndwu-scrollbar-padding-left]': 'normalizedPadding().left',
    '[style.--ndwu-scrollbar-padding-right]': 'normalizedPadding().right',
    '[style.--ndwu-scrollbar-padding-top]': 'normalizedPadding().top',
    '[style.--ndwu-scrollbar-padding-bottom]': 'normalizedPadding().bottom',
    '[style.--ndwu-scrollbar-content-padding-left]': 'normalizedContentPadding().left',
    '[style.--ndwu-scrollbar-content-padding-right]': 'normalizedContentPadding().right',
    '[style.--ndwu-scrollbar-content-padding-top]': 'normalizedContentPadding().top',
    '[style.--ndwu-scrollbar-content-padding-bottom]': 'normalizedContentPadding().bottom',
  },
})
export class NdwuScrollbarComponent {
  private static readonly AXIS_CONFIG: Record<ScrollbarAxis, AxisConfigEntry> = {
    y: {
      contentSize: 'scrollHeight',
      clientSize: 'clientHeight',
      scrollOffset: 'scrollTop',
      pointerCoord: 'clientY',
      rectStart: 'top',
      trackSize: 'clientHeight',
      thumbStyle: 'height',
      translateAxis: (v: number) => `translate3d(0, ${v}px, 0)`,
      overflowSignal: 'isOverflowingY',
    },
    x: {
      contentSize: 'scrollWidth',
      clientSize: 'clientWidth',
      scrollOffset: 'scrollLeft',
      pointerCoord: 'clientX',
      rectStart: 'left',
      trackSize: 'clientWidth',
      thumbStyle: 'width',
      translateAxis: (v: number) => `translate3d(${v}px, 0, 0)`,
      overflowSignal: 'isOverflowingX',
    },
  };

  private getConfig(axis: ScrollbarAxis): AxisConfigEntry {
    return NdwuScrollbarComponent.AXIS_CONFIG[axis];
  }

  public readonly ndwuScrollbarSize = input<Size>(SIZE.L);
  public readonly ndwuScrollbarAxis = input<'x' | 'y' | 'both'>('both');
  public readonly ndwuScrollbarPrintable = input(true, {transform: booleanAttribute});
  public readonly ndwuScrollbarDisabled = input(false, {transform: booleanAttribute});
  public readonly ndwuScrollbarPadding = input<NdwuScrollbarPadding>({});
  public readonly ndwuScrollbarContentPadding = input<NdwuScrollbarPadding>({});

  private readonly hostEl: HTMLElement = inject(ElementRef).nativeElement;
  private readonly doc: Document = this.hostEl.ownerDocument;
  private readonly destroyRef = inject(DestroyRef);

  private readonly contentEl = viewChild.required<ElementRef<HTMLElement>>('contentEl');
  private readonly trackYEl = viewChild.required<ElementRef<HTMLElement>>('trackY');
  private readonly trackXEl = viewChild.required<ElementRef<HTMLElement>>('trackX');
  private readonly thumbYEl = viewChild.required<ElementRef<HTMLElement>>('thumbY');
  private readonly thumbXEl = viewChild.required<ElementRef<HTMLElement>>('thumbX');

  protected readonly isOverflowingY = signal(false);
  protected readonly isOverflowingX = signal(false);
  protected readonly isDragging = signal(false);
  protected readonly isViewInitialized = signal(false);
  protected readonly normalizedSize = computed(() => {
    return this.ndwuScrollbarSize() === SIZE.XL ? SIZE.XL : SIZE.L;
  });

  protected readonly normalizedPadding = computed(() => {
    const defaultPadding: Required<NdwuScrollbarPadding> = this.normalizedSize() === 'L'
      ? {top: '0', left: '4px', right: '4px', bottom: '0'}
      : {top: '0', left: '3px', right: '3px', bottom: '0'};

    const inputPadding = this.ndwuScrollbarPadding();

    return {
      top: inputPadding?.top ?? defaultPadding.top,
      left: inputPadding?.left ?? defaultPadding.left,
      right: inputPadding?.right ?? defaultPadding.right,
      bottom: inputPadding?.bottom ?? defaultPadding.bottom,
    };
  });

  // Inner breathing room applied to the scroll box itself, distinct from the track gutter above.
  // Defaults to 0 per side and composes with the track-reservation padding in the SCSS calc().
  protected readonly normalizedContentPadding = computed(() => {
    const inputPadding = this.ndwuScrollbarContentPadding();

    return {
      top: inputPadding?.top ?? '0',
      left: inputPadding?.left ?? '0',
      right: inputPadding?.right ?? '0',
      bottom: inputPadding?.bottom ?? '0',
    };
  });

  private dragState: DragState | null = null;
  private recalculateFrameId: ReturnType<typeof requestAnimationFrame> | null = null;
  private positionFrameId: ReturnType<typeof requestAnimationFrame> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanup());

    afterNextRender(() => {
      const content = this.contentEl().nativeElement;

      this.syncFocusableContent(content);
      this.registerStaticListeners(content);
      this.initObservers(content);
      this.scheduleRecalculate();
      this.isViewInitialized.set(true);
    });

    effect(() => {
      const isDisabled = this.ndwuScrollbarDisabled();

      if (!this.isViewInitialized()) {
        return;
      }

      if (isDisabled) {
        this.cancelDrag();
        this.releaseContentBoxSize();

        return;
      }

      this.reobserveHost();
      this.scheduleRecalculate();
    });
  }

  public scrollTo(options: ScrollToOptions): void {
    this.contentEl().nativeElement.scrollTo(options);
  }

  private registerStaticListeners(content: HTMLElement): void {
    content.addEventListener('scroll', this.onScroll);
    this.hostEl.addEventListener('focus', this.onHostFocus);
  }

  private initObservers(content: HTMLElement): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === this.hostEl && !this.ndwuScrollbarDisabled()) {
            content.style.width = `${entry.contentRect.width}px`;
            content.style.height = `${entry.contentRect.height}px`;
          }
        }

        this.scheduleRecalculate();
      });

      this.resizeObserver.observe(this.hostEl);
      this.resizeObserver.observe(content);
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => {
        this.scheduleRecalculate();
      });

      this.mutationObserver.observe(
        content,
        {
          childList: true,
          subtree: true,
        },
      );
    }
  }

  private cancelDrag(): void {
    if (this.dragState !== null) {
      try {
        this.getAxisElements(this.dragState.axis).thumb.releasePointerCapture(this.dragState.pointerId);
      } catch {
        /* ignore */
      }

      this.isDragging.set(false);

      this.dragState = null;
    }

    this.unregisterDragListeners();
  }

  private releaseContentBoxSize(): void {
    const content = this.contentEl().nativeElement;

    content.style.width = '';
    content.style.height = '';

    this.isOverflowingY.set(false);
    this.isOverflowingX.set(false);
  }

  // Re-observing a target makes ResizeObserver deliver an immediate callback with its current
  // contentRect. That re-applies the inline content box size on re-enable without duplicating
  // the measurement math, and without waiting for an unrelated host resize that may never come.
  private reobserveHost(): void {
    this.resizeObserver?.unobserve(this.hostEl);
    this.resizeObserver?.observe(this.hostEl);
  }

  private readonly onScroll = (): void => {
    if (this.isDragging()) {
      return;
    }

    this.schedulePositionUpdate();
  };

  private getFrameId(key: 'recalculate' | 'position'): number | null {
    return key === 'recalculate' ? this.recalculateFrameId : this.positionFrameId;
  }

  private setFrameId(key: 'recalculate' | 'position', value: number | null): void {
    if (key === 'recalculate') {
      this.recalculateFrameId = value;
    } else {
      this.positionFrameId = value;
    }
  }

  private scheduleFrame(
    key: 'recalculate' | 'position',
    callback: () => void,
    mode: 'debounce' | 'throttle',
  ): void {
    const currentId = this.getFrameId(key);

    if (mode === 'throttle' && currentId !== null) {
      return;
    }

    if (mode === 'debounce' && currentId !== null) {
      cancelAnimationFrame(currentId);
    }

    this.setFrameId(
      key,
      requestAnimationFrame(() => {
        this.setFrameId(key, null);
        callback();
      }),
    );
  }

  private schedulePositionUpdate(): void {
    this.scheduleFrame(
      'position',
      () => {
        this.updateAxis('y');
        this.updateAxis('x');
      },
      'throttle',
    );
  }

  protected onThumbPointerDown(axis: ScrollbarAxis, event: PointerEvent): void {
    if (event.pointerType !== SUPPORTED_POINTER_TYPE) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.startDrag(event, axis);
  }

  protected onTrackPointerDown(axis: ScrollbarAxis, event: PointerEvent): void {
    if (event.pointerType !== SUPPORTED_POINTER_TYPE) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.startTrackClick(axis, event);
  }

  private readonly onHostFocus = (): void => {
    if (this.hostEl.ownerDocument.activeElement !== this.hostEl) {
      return;
    }

    this.contentEl().nativeElement.focus();
  };

  private startDrag(event: PointerEvent, axis: ScrollbarAxis): void {
    const {track, thumb} = this.getAxisElements(axis);
    const thumbRect = thumb.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();

    this.isDragging.set(true);

    this.dragState = {
      axis,
      pointerId: event.pointerId,
      pointerOffset: this.getPointerOffset(axis, event) - this.getRectStart(axis, thumbRect),
      trackStart: this.getRectStart(axis, trackRect),
    };

    thumb.setPointerCapture(event.pointerId);
    this.doc.addEventListener('pointermove', this.onDrag, true);
    this.doc.addEventListener('pointerup', this.onEndDrag, true);
    this.doc.addEventListener('pointercancel', this.onEndDrag, true);
  }

  private convertTrackToScroll(
    metrics: AxisMetrics,
    trackPosition: number,
    options: {centerOnThumb?: boolean} = {},
  ): number {
    const thumbSize = this.calculateThumbSize(metrics);
    const contentFree = metrics.contentSize - metrics.clientSize;
    const trackFree = metrics.trackSize - thumbSize;

    if (trackFree <= 0 || contentFree <= 0) {
      return metrics.scrollOffset;
    }

    const targetPosition = options.centerOnThumb
      ? trackPosition - (thumbSize / 2)
      : trackPosition;

    const ratio = this.clamp(targetPosition / trackFree, 0, 1);

    return ratio * contentFree;
  }

  private readonly onDrag = (event: PointerEvent): void => {
    const dragState = this.dragState;

    if (!this.isDragging() || event.pointerId !== dragState?.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const metrics = this.getAxisMetrics(dragState.axis);
    const pointerPosition = this.getPointerOffset(dragState.axis, event);
    const dragPosition = pointerPosition - dragState.trackStart - dragState.pointerOffset;
    const targetScroll = this.convertTrackToScroll(metrics, dragPosition);

    this.setScrollOffset(dragState.axis, this.contentEl().nativeElement, targetScroll);
    this.updateAxis(dragState.axis);
  };

  private readonly onEndDrag = (event: PointerEvent): void => {
    const dragState = this.dragState;

    if (!this.isDragging() || event.pointerId !== dragState?.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    try {
      this.getAxisElements(dragState.axis).thumb.releasePointerCapture(dragState.pointerId);
    } catch {
      /* ignore */
    }

    this.isDragging.set(false);

    this.dragState = null;

    this.unregisterDragListeners();
  };

  private startTrackClick(axis: ScrollbarAxis, event: PointerEvent): void {
    const content = this.contentEl().nativeElement;
    const elements = this.getAxisElements(axis);
    const metrics = this.getAxisMetrics(axis);

    const trackRect = elements.track.getBoundingClientRect();
    const trackStart = this.getRectStart(axis, trackRect);
    const pointerPosition = this.getPointerOffset(axis, event);
    const targetScroll = this.convertTrackToScroll(
      metrics,
      pointerPosition - trackStart,
      {
        centerOnThumb: true,
      },
    );

    this.setScrollOffset(axis, content, targetScroll);
    this.updateAxis(axis);
  }

  private scheduleRecalculate(): void {
    this.scheduleFrame('recalculate', () => this.recalculate(), 'debounce');
  }

  private recalculate(): void {
    if (this.ndwuScrollbarDisabled()) {
      return;
    }

    const content = this.contentEl().nativeElement;

    if (content.clientHeight === 0 && content.clientWidth === 0) {
      return;
    }

    this.updateOverflowState(content);
    this.updateAxis('y');
    this.updateAxis('x');
  }

  private updateOverflowState(content: HTMLElement): void {
    const axis = this.ndwuScrollbarAxis();

    this.isOverflowingY.set(
      (axis === 'y' || axis === 'both')
        && this.resolveOverflow(content.scrollHeight, content.clientHeight),
    );

    this.isOverflowingX.set(
      (axis === 'x' || axis === 'both')
        && this.resolveOverflow(content.scrollWidth, content.clientWidth),
    );
  }

  private resolveOverflow(contentSize: number, clientSize: number): boolean {
    return contentSize > clientSize;
  }

  private applyThumbSize(axis: ScrollbarAxis, size: number): void {
    const {thumb} = this.getAxisElements(axis);
    const styleKey = this.getConfig(axis).thumbStyle;

    thumb.style[styleKey] = `${size}px`;
  }

  private updateAxis(axis: ScrollbarAxis): void {
    const metrics = this.getAxisMetrics(axis);
    const overflowSignalKey = this.getConfig(axis).overflowSignal;
    const isOverflowing = this[overflowSignalKey]();
    const thumbSize = isOverflowing ? this.calculateThumbSize(metrics) : 0;

    this.applyThumbSize(axis, thumbSize);

    if (!isOverflowing || thumbSize <= 0) {
      this.applyThumbTransform(axis, 0);

      return;
    }

    const trackFree = metrics.trackSize - thumbSize;
    const contentFree = metrics.contentSize - metrics.clientSize;

    if (trackFree <= 0 || contentFree <= 0) {
      this.applyThumbTransform(axis, 0);

      return;
    }

    const offset = Math.floor((metrics.scrollOffset / contentFree) * trackFree);

    this.applyThumbTransform(axis, offset);
  }

  private getAxisElements(axis: ScrollbarAxis): AxisElements {
    return axis === 'y'
      ? {
        track: this.trackYEl().nativeElement,
        thumb: this.thumbYEl().nativeElement,
      }
      : {
        track: this.trackXEl().nativeElement,
        thumb: this.thumbXEl().nativeElement,
      };
  }

  private calculateThumbSize(metrics: AxisMetrics): number {
    if (metrics.contentSize <= 0 || metrics.trackSize <= 0) {
      return 0;
    }

    const ratio = metrics.clientSize / metrics.contentSize;

    return Math.min(metrics.trackSize, Math.max(Math.floor(ratio * metrics.trackSize), MIN_THUMB_SIZE));
  }

  private applyThumbTransform(axis: ScrollbarAxis, offset: number): void {
    this.getAxisElements(axis).thumb.style.transform = this.getConfig(axis).translateAxis(offset);
  }

  private getAxisMetrics(axis: ScrollbarAxis): AxisMetrics {
    const content = this.contentEl().nativeElement;
    const config = this.getConfig(axis);

    return {
      contentSize: content[config.contentSize],
      clientSize: content[config.clientSize],
      scrollOffset: content[config.scrollOffset],
      trackSize: this.hostEl[config.trackSize],
    };
  }

  private getPointerOffset(axis: ScrollbarAxis, event: MouseEvent | PointerEvent): number {
    return event[this.getConfig(axis).pointerCoord];
  }

  private getRectStart(axis: ScrollbarAxis, rect: DOMRect): number {
    return rect[this.getConfig(axis).rectStart];
  }

  private setScrollOffset(axis: ScrollbarAxis, content: HTMLElement, value: number): void {
    const config = this.getConfig(axis);
    const sizeKey = config.contentSize;
    const clientKey = config.clientSize;
    const contentFree = content[sizeKey] - content[clientKey];

    content[config.scrollOffset] = this.clamp(value, 0, Math.max(0, contentFree));
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private syncFocusableContent(content: HTMLElement): void {
    const tabindex = this.hostEl.getAttribute('tabindex');

    if (tabindex !== null && !content.hasAttribute('tabindex')) {
      content.setAttribute('tabindex', tabindex);
    }
  }

  private unregisterDragListeners(): void {
    this.doc.removeEventListener('pointermove', this.onDrag, true);
    this.doc.removeEventListener('pointerup', this.onEndDrag, true);
    this.doc.removeEventListener('pointercancel', this.onEndDrag, true);
  }

  private cleanup(): void {
    const content = this.contentEl()?.nativeElement;

    content?.removeEventListener('scroll', this.onScroll);
    this.hostEl.removeEventListener('focus', this.onHostFocus);
    this.cancelDrag();

    if (this.recalculateFrameId !== null) {
      cancelAnimationFrame(this.recalculateFrameId);
    }

    if (this.positionFrameId !== null) {
      cancelAnimationFrame(this.positionFrameId);
    }

    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }
}
