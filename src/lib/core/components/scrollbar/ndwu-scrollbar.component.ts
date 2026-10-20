/* eslint id-denylist: 0 */
import {
  ChangeDetectionStrategy,
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
import {NDWU_SIZE, NdwuSize} from '../../../shared.types';
import {
  type NdwuAxisConfigEntry,
  type NdwuAxisElements,
  type NdwuAxisMetrics,
  type NdwuDragState,
  type NdwuScrollbarAxis,
  type NdwuScrollbarPadding,
} from './ndwu-scrollbar.types';
import {
  DEFAULT_MIN_THUMB_SIZE,
  calculateThumbOffset,
  calculateThumbSize,
  clamp,
  convertTrackToScroll,
  hasOverflow,
  parseMinThumbSize,
} from './ndwu-scrollbar.geometry';
import {NdwuScrollbarDragController} from './ndwu-scrollbar-drag.controller';
import {resolveMutationRecalc} from './ndwu-scrollbar.mutations';

const MIN_THUMB_SIZE_PROPERTY = '--ndwu-scrollbar-min-thumb-size';

const SCROLLABLE_Y_CLASS = 'ndwu-scrollbar--scrollable-y';
const SCROLLABLE_X_CLASS = 'ndwu-scrollbar--scrollable-x';

// Attribute changes that can resize descendants without touching the DOM tree
const OBSERVED_ATTRIBUTES = ['class', 'hidden'];

// Quiet period after text/attribute mutations before the full recalculation that catches
// a shrink no observer reports. Longer than the gaps inside a mutation burst (frame-driven
// updates, hover across a list), short enough for the late shrink to read as a reaction.
const MUTATION_SETTLE_DELAY = 150;

// only mouse pointers receive custom track/thumb interaction. Touch/pen fall back to native scroll.
const SUPPORTED_POINTER_TYPE = 'mouse';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[ndwuScrollbar]',
  exportAs: 'ndwuScrollbar',
  templateUrl: './ndwu-scrollbar.component.html',
  styleUrl: './ndwu-scrollbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ndwu-scrollbar--size-l]': 'normalizedSize() === "L"',
    '[class.ndwu-scrollbar--size-xl]': 'normalizedSize() === "XL"',
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
  private static readonly AXIS_CONFIG: Record<NdwuScrollbarAxis, NdwuAxisConfigEntry> = {
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

  private getConfig(axis: NdwuScrollbarAxis): NdwuAxisConfigEntry {
    return NdwuScrollbarComponent.AXIS_CONFIG[axis];
  }

  public readonly ndwuScrollbarSize = input<NdwuSize>(NDWU_SIZE.L);
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
    return this.ndwuScrollbarSize() === NDWU_SIZE.XL ? NDWU_SIZE.XL : NDWU_SIZE.L;
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

  private readonly dragController = new NdwuScrollbarDragController(this.doc, {
    move: (state, event) => this.onDragMove(state, event),
    activeChange: (isActive) => this.isDragging.set(isActive),
  });

  private minThumbSize = DEFAULT_MIN_THUMB_SIZE;
  private lastContentSize = {width: 0, height: 0};
  private recalculateFrameId: ReturnType<typeof requestAnimationFrame> | null = null;
  private positionFrameId: ReturnType<typeof requestAnimationFrame> | null = null;
  private mutationSettleTimerId: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private observedContentChildren = new Set<Element>();

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
        this.dragController.end();
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

  public refresh(): void {
    this.scheduleRecalculate();
  }

  private registerStaticListeners(content: HTMLElement): void {
    content.addEventListener('scroll', this.onScroll);
    this.hostEl.addEventListener('focus', this.onHostFocus);
  }

  private initObservers(content: HTMLElement): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        const isHostResized = entries.some(entry => entry.target === this.hostEl);

        if (isHostResized && !this.ndwuScrollbarDisabled()) {
          this.syncContentBoxSize();
        }

        this.scheduleRecalculate();
      });

      this.resizeObserver.observe(this.hostEl);
      this.resizeObserver.observe(content);
      this.observeContentChildren(content);
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver((records) => {
        if (resolveMutationRecalc(records) === 'full') {
          this.observeContentChildren(content);
          this.scheduleRecalculate();

          return;
        }

        // A full recalculation re-lays out the whole content twice, too costly for a stream
        // of text/class changes (timers, hover): check the scroll size each frame instead and
        // recalculate fully once the stream settles.
        this.schedulePositionUpdate();
        this.scheduleMutationSettle(content);
      });

      // The content box is pinned, so a text or class change deep inside it that changes
      // the overflow without resizing a direct child is only visible to this observer.
      this.mutationObserver.observe(
        content,
        {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: OBSERVED_ATTRIBUTES,
        },
      );
    }
  }

  // Children are not pinned like the content box itself, so observing them reports
  // content growth/shrink that does not touch the DOM tree (images loading, text reflow).
  private observeContentChildren(content: HTMLElement): void {
    const resizeObserver = this.resizeObserver;

    if (resizeObserver === null) {
      return;
    }

    const children = this.collectLayoutChildren(content, new Set());

    for (const child of this.observedContentChildren) {
      if (!children.has(child)) {
        resizeObserver.unobserve(child);
      }
    }

    for (const child of children) {
      if (!this.observedContentChildren.has(child)) {
        resizeObserver.observe(child);
      }
    }

    this.observedContentChildren = children;
  }

  // `display: contents` elements generate no box, so ResizeObserver never reports them;
  // their own children are the boxes that change size.
  private collectLayoutChildren(parent: Element, result: Set<Element>): Set<Element> {
    for (const child of Array.from(parent.children)) {
      if (getComputedStyle(child).display === 'contents') {
        this.collectLayoutChildren(child, result);
      } else {
        result.add(child);
      }
    }

    return result;
  }

  // The content box is pinned to the host size to become the scroll box. A host sized by its own
  // content (e.g. a dialog body with `height: auto`) would then stay at its first size forever,
  // so release the pin, let the host settle to its natural size within the outer limits and pin
  // again. Hosts sized from outside measure the same and keep their size.
  private syncContentBoxSize(): void {
    const content = this.contentEl().nativeElement;
    const {scrollTop, scrollLeft} = content;

    content.style.width = '';
    content.style.height = '';

    const hostSize = this.measureHostContentBox();

    if (hostSize !== null) {
      content.style.width = `${hostSize.width}px`;
      content.style.height = `${hostSize.height}px`;
    }

    // released content box has nothing to scroll, so the browser resets the offsets
    content.scrollTop = scrollTop;
    content.scrollLeft = scrollLeft;
  }

  // Computed size keeps fractional pixels (unlike clientWidth/clientHeight) and ignores
  // transforms (unlike getBoundingClientRect), so open/close animations do not skew it.
  private measureHostContentBox(): {width: number; height: number} | null {
    const style = getComputedStyle(this.hostEl);
    const width = parseFloat(style.width);
    const height = parseFloat(style.height);

    if (Number.isNaN(width) || Number.isNaN(height)) {
      return null;
    }

    if (style.boxSizing !== 'border-box') {
      return {width, height};
    }

    const sumPx = (...values: string[]): number => {
      return values.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    };

    return {
      width: width - sumPx(style.paddingLeft, style.paddingRight, style.borderLeftWidth, style.borderRightWidth),
      height: height - sumPx(style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth),
    };
  }

  private releaseContentBoxSize(): void {
    const content = this.contentEl().nativeElement;

    content.style.width = '';
    content.style.height = '';

    this.setOverflowState(false, false);
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

  private scheduleMutationSettle(content: HTMLElement): void {
    if (this.mutationSettleTimerId !== null) {
      clearTimeout(this.mutationSettleTimerId);
    }

    this.mutationSettleTimerId = setTimeout(
      () => {
        this.mutationSettleTimerId = null;

        // a class change may have toggled `display: contents` on a child
        this.observeContentChildren(content);
        this.scheduleRecalculate();
      },
      MUTATION_SETTLE_DELAY,
    );
  }

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

  private cancelFrame(key: 'recalculate' | 'position'): void {
    const currentId = this.getFrameId(key);

    if (currentId !== null) {
      cancelAnimationFrame(currentId);
      this.setFrameId(key, null);
    }
  }

  // Throttled rather than debounced: a debounced frame keeps getting pushed back by changes
  // arriving every frame and never runs while they last.
  private schedulePositionUpdate(): void {
    this.scheduleFrame(
      'position',
      () => {
        if (this.isContentSizeChanged()) {
          this.cancelFrame('recalculate');
          this.recalculate();

          return;
        }

        this.updateAxis('y');
        this.updateAxis('x');
      },
      'throttle',
    );
  }

  // The pinned content box only reports growth past its own size here, which is what text and
  // class changes are checked for; scrolling uses it as a safety net against stale metrics.
  private isContentSizeChanged(): boolean {
    const content = this.contentEl().nativeElement;

    return content.scrollWidth !== this.lastContentSize.width
      || content.scrollHeight !== this.lastContentSize.height;
  }

  protected onThumbPointerDown(axis: NdwuScrollbarAxis, event: PointerEvent): void {
    if (event.pointerType !== SUPPORTED_POINTER_TYPE) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.startDrag(event, axis);
  }

  protected onTrackPointerDown(axis: NdwuScrollbarAxis, event: PointerEvent): void {
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

  private startDrag(event: PointerEvent, axis: NdwuScrollbarAxis): void {
    const {track, thumb} = this.getAxisElements(axis);
    const thumbRect = thumb.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();

    this.dragController.start(event, thumb, {
      axis,
      pointerId: event.pointerId,
      pointerOffset: this.getPointerOffset(axis, event) - this.getRectStart(axis, thumbRect),
      trackStart: this.getRectStart(axis, trackRect),
    });
  }

  private onDragMove(state: NdwuDragState, event: PointerEvent): void {
    const metrics = this.getAxisMetrics(state.axis);
    const thumbSize = calculateThumbSize(metrics, this.minThumbSize);
    const pointerPosition = this.getPointerOffset(state.axis, event);
    const dragPosition = pointerPosition - state.trackStart - state.pointerOffset;
    const targetScroll = convertTrackToScroll(metrics, thumbSize, dragPosition);

    this.setScrollOffset(state.axis, this.contentEl().nativeElement, targetScroll);
    this.updateAxis(state.axis);
  }

  private startTrackClick(axis: NdwuScrollbarAxis, event: PointerEvent): void {
    const content = this.contentEl().nativeElement;
    const elements = this.getAxisElements(axis);
    const metrics = this.getAxisMetrics(axis);

    const trackRect = elements.track.getBoundingClientRect();
    const trackStart = this.getRectStart(axis, trackRect);
    const pointerPosition = this.getPointerOffset(axis, event);
    const targetScroll = convertTrackToScroll(
      metrics,
      calculateThumbSize(metrics, this.minThumbSize),
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

    this.syncContentBoxSize();

    const content = this.contentEl().nativeElement;

    if (content.clientHeight === 0 && content.clientWidth === 0) {
      return;
    }

    this.minThumbSize = parseMinThumbSize(getComputedStyle(this.hostEl).getPropertyValue(MIN_THUMB_SIZE_PROPERTY));

    this.updateOverflowState(content);
    this.lastContentSize = {width: content.scrollWidth, height: content.scrollHeight};
    this.updateAxis('y');
    this.updateAxis('x');
  }

  private updateOverflowState(content: HTMLElement): void {
    const axis = this.ndwuScrollbarAxis();

    this.setOverflowState(
      (axis === 'y' || axis === 'both') && hasOverflow(content.scrollHeight, content.clientHeight),
      (axis === 'x' || axis === 'both') && hasOverflow(content.scrollWidth, content.clientWidth),
    );
  }

  // The classes show the tracks and shorten each other's track, and the thumb is measured
  // against the track right after, so they are toggled here instead of waiting for change
  // detection to apply them as host bindings.
  private setOverflowState(isOverflowingY: boolean, isOverflowingX: boolean): void {
    this.isOverflowingY.set(isOverflowingY);
    this.isOverflowingX.set(isOverflowingX);

    this.hostEl.classList.toggle(SCROLLABLE_Y_CLASS, isOverflowingY);
    this.hostEl.classList.toggle(SCROLLABLE_X_CLASS, isOverflowingX);
  }

  private applyThumbSize(axis: NdwuScrollbarAxis, size: number): void {
    const {thumb} = this.getAxisElements(axis);
    const styleKey = this.getConfig(axis).thumbStyle;

    thumb.style[styleKey] = `${size}px`;
  }

  private updateAxis(axis: NdwuScrollbarAxis): void {
    const overflowSignalKey = this.getConfig(axis).overflowSignal;

    if (!this[overflowSignalKey]()) {
      this.applyThumbSize(axis, 0);
      this.applyThumbTransform(axis, 0);

      return;
    }

    const metrics = this.getAxisMetrics(axis);
    const thumbSize = calculateThumbSize(metrics, this.minThumbSize);

    this.applyThumbSize(axis, thumbSize);
    this.applyThumbTransform(axis, calculateThumbOffset(metrics, thumbSize));
  }

  private getAxisElements(axis: NdwuScrollbarAxis): NdwuAxisElements {
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

  private applyThumbTransform(axis: NdwuScrollbarAxis, offset: number): void {
    this.getAxisElements(axis).thumb.style.transform = this.getConfig(axis).translateAxis(offset);
  }

  private getAxisMetrics(axis: NdwuScrollbarAxis): NdwuAxisMetrics {
    const content = this.contentEl().nativeElement;
    const config = this.getConfig(axis);

    return {
      contentSize: content[config.contentSize],
      clientSize: content[config.clientSize],
      scrollOffset: content[config.scrollOffset],
      trackSize: this.measureTrackSize(axis),
    };
  }

  // The track is inset from the host by its padding and, when both tracks are visible,
  // shortened by the other one, so its own length is the one consistent with its start
  // coordinate that pointer positions are measured from. Computed size keeps fractional
  // pixels (clientWidth/clientHeight round them up past the track end) and ignores transforms.
  private measureTrackSize(axis: NdwuScrollbarAxis): number {
    const {track} = this.getAxisElements(axis);
    const size = parseFloat(getComputedStyle(track)[this.getConfig(axis).thumbStyle]);

    return Number.isNaN(size) ? 0 : size;
  }

  private getPointerOffset(axis: NdwuScrollbarAxis, event: MouseEvent | PointerEvent): number {
    return event[this.getConfig(axis).pointerCoord];
  }

  private getRectStart(axis: NdwuScrollbarAxis, rect: DOMRect): number {
    return rect[this.getConfig(axis).rectStart];
  }

  private setScrollOffset(axis: NdwuScrollbarAxis, content: HTMLElement, value: number): void {
    const config = this.getConfig(axis);
    const sizeKey = config.contentSize;
    const clientKey = config.clientSize;
    const contentFree = content[sizeKey] - content[clientKey];

    content[config.scrollOffset] = clamp(value, 0, Math.max(0, contentFree));
  }

  private syncFocusableContent(content: HTMLElement): void {
    const tabindex = this.hostEl.getAttribute('tabindex');

    if (tabindex !== null && !content.hasAttribute('tabindex')) {
      content.setAttribute('tabindex', tabindex);
    }
  }

  private cleanup(): void {
    const content = this.contentEl()?.nativeElement;

    content?.removeEventListener('scroll', this.onScroll);
    this.hostEl.removeEventListener('focus', this.onHostFocus);
    this.dragController.end();

    this.cancelFrame('recalculate');
    this.cancelFrame('position');

    if (this.mutationSettleTimerId !== null) {
      clearTimeout(this.mutationSettleTimerId);
    }

    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }
}
