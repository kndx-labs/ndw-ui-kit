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
  numberAttribute,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {NDWU_SIZE, NdwuSize} from '../../../shared.types';
import type {
  NdwuAxisElements,
  NdwuAxisMetrics,
  NdwuDragState,
  NdwuScrollbarAxis,
} from './ndwu-scrollbar.internal-types';
import type {NdwuScrollbarPadding} from './ndwu-scrollbar.types';
import {
  calculateThumbOffset,
  calculateThumbSize,
  canScrollToward,
  convertTrackToScroll,
  hasOverflow,
  resolveWheelDelta,
} from './ndwu-scrollbar.geometry';
import {NdwuScrollbarDragController} from './ndwu-scrollbar-drag.controller';
import {NdwuScrollbarContentObserver} from './ndwu-scrollbar.content-observer';
import {NdwuFrameScheduler} from './ndwu-scrollbar.frame-scheduler';
import {
  DEFAULT_MIN_THUMB_SIZE,
  type NdwuBoxSize,
  clearContentBoxSize,
  parseMinThumbSize,
  syncContentBoxSize,
} from './ndwu-scrollbar.dom';

const MIN_THUMB_SIZE_PROPERTY = '--ndwu-scrollbar-min-thumb-size';

const DEFAULT_HIDE_DELAY_MS = 1000;

function transformHideDelay(value: unknown): number {
  return numberAttribute(value, DEFAULT_HIDE_DELAY_MS);
}

// The thumb is dragged by any direct pointer; the track jumps to the clicked point only for a
// mouse, because a touch on the track is far more likely a missed swipe than an aimed tap.
const THUMB_POINTER_TYPES: readonly string[] = ['mouse', 'touch', 'pen'];
const TRACK_POINTER_TYPES: readonly string[] = ['mouse'];
const TOUCH_POINTER_TYPES: readonly string[] = ['touch', 'pen'];

const COARSE_POINTER_QUERY = '(pointer: coarse)';

const SCROLLABLE_Y_CLASS = 'ndwu-scrollbar--scrollable-y';
const SCROLLABLE_X_CLASS = 'ndwu-scrollbar--scrollable-x';

const AXIS_CONFIG = {
  y: {
    contentSize: 'scrollHeight',
    clientSize: 'clientHeight',
    scrollOffset: 'scrollTop',
    pointerCoord: 'clientY',
    rectStart: 'top',
    thumbStyle: 'height',
    trackEndStyle: 'right',
    hitInsetProperty: '--ndwu-scrollbar-hit-inset-y',
    translateAxis: (v: number) => `translate3d(0, ${v}px, 0)`,
  },
  x: {
    contentSize: 'scrollWidth',
    clientSize: 'clientWidth',
    scrollOffset: 'scrollLeft',
    pointerCoord: 'clientX',
    rectStart: 'left',
    thumbStyle: 'width',
    trackEndStyle: 'bottom',
    hitInsetProperty: '--ndwu-scrollbar-hit-inset-x',
    translateAxis: (v: number) => `translate3d(${v}px, 0, 0)`,
  },
} as const;

/**
 * Right-to-left layout is not supported: vertical tracks stay on the right.
 * Negative RTL `scrollLeft` values are not handled.
 */
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
    '[class.ndwu-scrollbar--dragging-y]': 'draggingAxis() === "y"',
    '[class.ndwu-scrollbar--dragging-x]': 'draggingAxis() === "x"',
    '[class.ndwu-scrollbar--auto-hide]': 'ndwuScrollbarAutoHide()',
    '[class.ndwu-scrollbar--active]': 'isActive()',
    '[class.ndwu-scrollbar--touch]': 'isTouchPointer()',
    '[class.ndwu-scrollbar--axis-y]': 'ndwuScrollbarAxis() === "y"',
    '[class.ndwu-scrollbar--axis-x]': 'ndwuScrollbarAxis() === "x"',
    '[class.ndwu-scrollbar--axis-both]': 'ndwuScrollbarAxis() === "both"',
    '[class.ndwu-scrollbar--unprintable]': '!ndwuScrollbarPrintable()',
    '[class.ndwu-scrollbar--disabled]': 'ndwuScrollbarDisabled()',
    '[style.--ndwu-scrollbar-padding-left]': 'ndwuScrollbarPadding().left',
    '[style.--ndwu-scrollbar-padding-right]': 'ndwuScrollbarPadding().right',
    '[style.--ndwu-scrollbar-padding-top]': 'ndwuScrollbarPadding().top',
    '[style.--ndwu-scrollbar-padding-bottom]': 'ndwuScrollbarPadding().bottom',
    '[style.--ndwu-scrollbar-content-padding-left]': 'ndwuScrollbarContentPadding().left',
    '[style.--ndwu-scrollbar-content-padding-right]': 'ndwuScrollbarContentPadding().right',
    '[style.--ndwu-scrollbar-content-padding-top]': 'ndwuScrollbarContentPadding().top',
    '[style.--ndwu-scrollbar-content-padding-bottom]': 'ndwuScrollbarContentPadding().bottom',
    '[style.--ndwu-scrollbar-touch-target-size]': 'ndwuScrollbarTouchTargetSize()',
  },
})
export class NdwuScrollbarComponent {
  public readonly ndwuScrollbarSize = input<NdwuSize>(NDWU_SIZE.L);
  /** Scrolling axis. Content overflowing on the other axis is clipped; use `both` to scroll it. */
  public readonly ndwuScrollbarAxis = input<'x' | 'y' | 'both'>('both');
  public readonly ndwuScrollbarPrintable = input(true, {transform: booleanAttribute});
  public readonly ndwuScrollbarDisabled = input(false, {transform: booleanAttribute});
  /**
   * Hides the tracks until the content is scrolled. On coarse-pointer screens, tracks overlay
   * content instead of reserving space.
   */
  public readonly ndwuScrollbarAutoHide = input(false, {transform: booleanAttribute});
  public readonly ndwuScrollbarPadding = input<NdwuScrollbarPadding>({});
  public readonly ndwuScrollbarContentPadding = input<NdwuScrollbarPadding>({});
  /**
   * Minimum cross size of the touch target around the thumb while it is active, as a CSS length.
   * Defaults to the `--ndwu-scrollbar-touch-target-size` token (44px).
   */
  public readonly ndwuScrollbarTouchTargetSize = input<string | undefined>(undefined);
  /**
   * Milliseconds the scrollbar stays active after the last scroll or drag end: the touch target
   * stays wide and auto-hidden tracks stay visible. Defaults to 1000.
   */
  public readonly ndwuScrollbarHideDelay = input(DEFAULT_HIDE_DELAY_MS, {transform: transformHideDelay});

  private readonly hostEl: HTMLElement = inject(ElementRef).nativeElement;
  private readonly doc: Document = this.hostEl.ownerDocument;
  private readonly destroyRef = inject(DestroyRef);
  private readonly coarsePointerQuery = this.doc.defaultView?.matchMedia?.(COARSE_POINTER_QUERY);

  private readonly contentEl = viewChild.required<ElementRef<HTMLElement>>('contentEl');
  private readonly trackYEl = viewChild.required<ElementRef<HTMLElement>>('trackY');
  private readonly trackXEl = viewChild.required<ElementRef<HTMLElement>>('trackX');
  private readonly thumbYEl = viewChild.required<ElementRef<HTMLElement>>('thumbY');
  private readonly thumbXEl = viewChild.required<ElementRef<HTMLElement>>('thumbX');

  protected readonly draggingAxis = signal<NdwuScrollbarAxis | null>(null);
  protected readonly isDragging = computed(() => {
    return this.draggingAxis() !== null;
  });
  protected readonly isViewInitialized = signal(false);
  // Active while dragging and for ndwuScrollbarHideDelay() after the last scroll or drag end.
  protected readonly isActive = signal(false);
  // The last pointer pressed inside the host was touch or pen. Gates the wide touch target and
  // lets touches on the track fall through to the content. Starts from the primary pointer, so
  // the first touch on a phone already passes through.
  protected readonly isTouchPointer = signal(this.coarsePointerQuery?.matches ?? false);
  protected readonly normalizedSize = computed(() => {
    return this.ndwuScrollbarSize() === NDWU_SIZE.XL ? NDWU_SIZE.XL : NDWU_SIZE.L;
  });

  private readonly dragController = new NdwuScrollbarDragController(
    this.doc,
    {
      move: (state, event) => this.onDragMove(state, event),
      activeChange: (state) => {
        this.draggingAxis.set(state?.axis ?? null);
        this.markActive();

        if (state === null) {
          this.schedulePositionUpdate();
        }
      },
    },
  );

  private minThumbSize = DEFAULT_MIN_THUMB_SIZE;
  private lastContentSize: NdwuBoxSize = {width: 0, height: 0};
  private readonly overflow: Record<NdwuScrollbarAxis, boolean> = {x: false, y: false};
  private readonly trackSizes: Record<NdwuScrollbarAxis, number> = {x: 0, y: 0};
  private readonly frames = new NdwuFrameScheduler<'recalculate' | 'position'>();
  private contentObserver: NdwuScrollbarContentObserver | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly hitInsets: Record<NdwuScrollbarAxis, string> = {x: '', y: ''};

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanup());

    afterNextRender(() => {
      const content = this.contentEl().nativeElement;

      this.syncFocusableContent(content);
      this.registerStaticListeners(content);
      this.observeContent(content);
      this.scheduleRecalculate();
      this.isViewInitialized.set(true);
    });

    effect(() => {
      const isDisabled = this.ndwuScrollbarDisabled();

      if (!this.isViewInitialized()) {
        return;
      }

      if (isDisabled) {
        untracked(() => {
          this.dragController.end();
          this.resetActivity();
          this.releaseContentBoxSize();
        });

        return;
      }

      this.contentObserver?.reobserveHost();
      this.scheduleRecalculate();
    });

    effect(() => {
      // Track geometry inputs can change without observer callbacks.
      this.ndwuScrollbarAxis();
      this.normalizedSize();
      this.ndwuScrollbarPadding();

      if (!this.isViewInitialized()) {
        return;
      }

      this.scheduleRecalculate();
    });
  }

  public scrollTo(options: ScrollToOptions): void {
    this.contentEl().nativeElement.scrollTo(options);
  }

  /**
   * Recalculates scrollbar geometry. Call after changing track size, track padding, or minimum
   * thumb CSS variables without changing their corresponding inputs (e.g. through a theme,
   * external class, or inline style).
   */
  public refresh(): void {
    this.scheduleRecalculate();
  }

  private registerStaticListeners(content: HTMLElement): void {
    content.addEventListener('scroll', this.onScroll);
    this.hostEl.addEventListener('focus', this.onHostFocus);
    // Capture phase: the thumb stops propagation of the pointerdown it claims.
    this.hostEl.addEventListener('pointerdown', this.onHostPointerDown, true);
    this.trackYEl().nativeElement.addEventListener('wheel', this.onTrackWheel, {passive: false});
    this.trackXEl().nativeElement.addEventListener('wheel', this.onTrackWheel, {passive: false});
  }

  private observeContent(content: HTMLElement): void {
    this.contentObserver = new NdwuScrollbarContentObserver(
      this.hostEl,
      content,
      {
        hostResize: () => {
          if (!this.ndwuScrollbarDisabled()) {
            syncContentBoxSize(content, this.hostEl);
          }
        },
        contentChange: (recalc) => {
          if (recalc === 'full') {
            this.scheduleRecalculate();
          } else {
            this.schedulePositionUpdate();
          }
        },
      },
    );
  }

  private releaseContentBoxSize(): void {
    clearContentBoxSize(this.contentEl().nativeElement);
    this.setOverflowState(false, false);
  }

  private readonly onScroll = (): void => {
    if (this.ndwuScrollbarDisabled()) {
      return;
    }

    this.markActive();

    if (this.isDragging()) {
      return;
    }

    this.schedulePositionUpdate();
  };

  private readonly onHostPointerDown = (event: PointerEvent): void => {
    this.isTouchPointer.set(TOUCH_POINTER_TYPES.includes(event.pointerType));
  };

  // `--active` matters only for the touch target and for auto-hide, so a mouse on a
  // fine-pointer device never starts the timer.
  private markActive(): void {
    this.clearIdleTimer();

    const isActivityShown = this.isTouchPointer() || (this.coarsePointerQuery?.matches ?? false);

    if (!isActivityShown) {
      this.isActive.set(false);

      return;
    }

    this.isActive.set(true);

    if (this.isDragging()) {
      return;
    }

    this.idleTimer = setTimeout(
      () => {
        this.idleTimer = undefined;
        this.isActive.set(false);
      },
      this.ndwuScrollbarHideDelay(),
    );
  }

  private resetActivity(): void {
    this.clearIdleTimer();
    this.isActive.set(false);
  }

  private clearIdleTimer(): void {
    clearTimeout(this.idleTimer);
    this.idleTimer = undefined;
  }

  private schedulePositionUpdate(): void {
    this.frames.schedule(
      'position',
      () => {
        if (this.isContentSizeChanged()) {
          this.frames.cancel('recalculate');
          this.recalculate();

          return;
        }

        this.updateAxis('y');
        this.updateAxis('x');
      },
    );
  }

  // The scroll size of the fixed-size content box equals the box size while the content fits
  // and follows the content size once it doesn't. Used to check text/class changes and, on
  // scroll, as a safety net for changes the observers missed.
  private isContentSizeChanged(): boolean {
    const content = this.contentEl().nativeElement;

    return content.scrollWidth !== this.lastContentSize.width
      || content.scrollHeight !== this.lastContentSize.height;
  }

  protected onThumbPointerDown(axis: NdwuScrollbarAxis, event: PointerEvent): void {
    if (this.ndwuScrollbarDisabled() || !this.overflow[axis] || !this.claimPointer(event, THUMB_POINTER_TYPES)) {
      return;
    }

    this.startDrag(axis, event);
  }

  protected onTrackPointerDown(axis: NdwuScrollbarAxis, event: PointerEvent): void {
    if (this.ndwuScrollbarDisabled() || !this.overflow[axis] || !this.claimPointer(event, TRACK_POINTER_TYPES)) {
      return;
    }

    this.startTrackClick(axis, event);
  }

  private claimPointer(event: PointerEvent, pointerTypes: readonly string[]): boolean {
    const isSupportedPointer = pointerTypes.includes(event.pointerType);

    if (!isSupportedPointer || !event.isPrimary || event.button !== 0 || this.isDragging()) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();

    return true;
  }

  private readonly onHostFocus = (): void => {
    if (this.doc.activeElement !== this.hostEl) {
      return;
    }

    this.contentEl().nativeElement.focus();
  };

  // Tracks are siblings of content, so a wheel over one chains through the overflow:hidden host
  // to the page. At an edge, leave it alone so it chains as it would from a native scroller.
  private readonly onTrackWheel = (event: WheelEvent): void => {
    if (event.ctrlKey) {
      return;
    }

    let deltaX = event.deltaX;
    let deltaY = event.deltaY;

    if (event.shiftKey && event.deltaX === 0) {
      deltaX = event.deltaY;
      deltaY = 0;
    }

    const content = this.contentEl().nativeElement;
    const metricsX = this.getAxisMetrics('x');
    const metricsY = this.getAxisMetrics('y');
    const pixelDeltaX = resolveWheelDelta(deltaX, event.deltaMode, metricsX.clientSize);
    const pixelDeltaY = resolveWheelDelta(deltaY, event.deltaMode, metricsY.clientSize);
    const canScrollX = this.overflow.x && canScrollToward(metricsX, pixelDeltaX);
    const canScrollY = this.overflow.y && canScrollToward(metricsY, pixelDeltaY);

    if (!canScrollX && !canScrollY) {
      return;
    }

    event.preventDefault();

    if (canScrollX) {
      content.scrollLeft += pixelDeltaX;
    }

    if (canScrollY) {
      content.scrollTop += pixelDeltaY;
    }
  };

  private startDrag(axis: NdwuScrollbarAxis, event: PointerEvent): void {
    const {track, thumb} = this.getAxisElements(axis);
    const thumbRect = thumb.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const config = AXIS_CONFIG[axis];

    this.dragController.start(event, thumb, {
      axis,
      pointerId: event.pointerId,
      pointerOffset: event[config.pointerCoord] - thumbRect[config.rectStart],
      trackStart: trackRect[config.rectStart],
    });
  }

  private onDragMove(state: NdwuDragState, event: PointerEvent): void {
    const pointerPosition = event[AXIS_CONFIG[state.axis].pointerCoord];

    this.scrollThumbTo(state.axis, pointerPosition - state.trackStart - state.pointerOffset);
  }

  // Centers the thumb on the clicked point, then keeps dragging until release.
  private startTrackClick(axis: NdwuScrollbarAxis, event: PointerEvent): void {
    const {track} = this.getAxisElements(axis);
    const config = AXIS_CONFIG[axis];
    const trackStart = track.getBoundingClientRect()[config.rectStart];
    const thumbSize = calculateThumbSize(this.getAxisMetrics(axis), this.minThumbSize);
    const pointerPosition = event[config.pointerCoord];

    this.scrollThumbTo(axis, pointerPosition - trackStart - (thumbSize / 2));
    this.startDrag(axis, event);
  }

  // Scrolls the content so that the thumb starts at `thumbStart`, counted from the track start.
  // The browser clamps the scroll offset itself.
  private scrollThumbTo(axis: NdwuScrollbarAxis, thumbStart: number): void {
    const metrics = this.getAxisMetrics(axis);
    const thumbSize = calculateThumbSize(metrics, this.minThumbSize);
    const scrollOffsetKey = AXIS_CONFIG[axis].scrollOffset;

    this.contentEl().nativeElement[scrollOffsetKey] = convertTrackToScroll(metrics, thumbSize, thumbStart);

    this.updateAxis(axis);
  }

  private scheduleRecalculate(): void {
    this.frames.schedule('recalculate', () => this.recalculate());
  }

  private recalculate(): void {
    if (this.ndwuScrollbarDisabled()) {
      return;
    }

    const content = this.contentEl().nativeElement;

    syncContentBoxSize(content, this.hostEl);

    if (content.clientHeight === 0 && content.clientWidth === 0) {
      return;
    }

    this.minThumbSize = parseMinThumbSize(getComputedStyle(this.hostEl).getPropertyValue(MIN_THUMB_SIZE_PROPERTY));

    this.updateOverflowState(content);
    this.measureTrackSizes();

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

  // Measure the tracks themselves, not the host: padding and the other visible track shorten them.
  // Computed style preserves fractional pixels; clientWidth/clientHeight round them up and can
  // place the thumb end past the track end.
  //
  // The used distance from the track end to the host edge is also stored in px, so the touch
  // target can reach the edge whatever unit the track padding uses (%, calc()). All reads go
  // first: a style write between getComputedStyle() calls would force another style recalc.
  private measureTrackSizes(): void {
    const hitInsets: Record<NdwuScrollbarAxis, string> = {x: '0px', y: '0px'};

    for (const axis of ['x', 'y'] as const) {
      if (!this.overflow[axis]) {
        this.trackSizes[axis] = 0;

        continue;
      }

      const {track} = this.getAxisElements(axis);
      const config = AXIS_CONFIG[axis];
      const usedStyle = getComputedStyle(track);

      this.trackSizes[axis] = parseFloat(usedStyle[config.thumbStyle]) || 0;
      hitInsets[axis] = `${parseFloat(usedStyle[config.trackEndStyle]) || 0}px`;
    }

    for (const axis of ['x', 'y'] as const) {
      this.applyHitInset(axis, hitInsets[axis]);
    }
  }

  private applyHitInset(axis: NdwuScrollbarAxis, value: string): void {
    if (this.hitInsets[axis] === value) {
      return;
    }

    this.hitInsets[axis] = value;
    this.hostEl.style.setProperty(AXIS_CONFIG[axis].hitInsetProperty, value);
  }

  // These classes show the tracks (and shorten one track when both are visible). The thumb is
  // measured against the track right after this, so the classes are set directly instead of
  // waiting for change detection to apply host bindings.
  private setOverflowState(isOverflowingY: boolean, isOverflowingX: boolean): void {
    this.overflow.y = isOverflowingY;
    this.overflow.x = isOverflowingX;

    this.hostEl.classList.toggle(SCROLLABLE_Y_CLASS, isOverflowingY);
    this.hostEl.classList.toggle(SCROLLABLE_X_CLASS, isOverflowingX);
  }

  private applyThumbSize(axis: NdwuScrollbarAxis, size: number): void {
    const {thumb} = this.getAxisElements(axis);
    const styleKey = AXIS_CONFIG[axis].thumbStyle;

    thumb.style[styleKey] = `${size}px`;
  }

  private updateAxis(axis: NdwuScrollbarAxis): void {
    if (!this.overflow[axis]) {
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
    this.getAxisElements(axis).thumb.style.transform = AXIS_CONFIG[axis].translateAxis(offset);
  }

  private getAxisMetrics(axis: NdwuScrollbarAxis): NdwuAxisMetrics {
    const content = this.contentEl().nativeElement;
    const config = AXIS_CONFIG[axis];

    return {
      contentSize: content[config.contentSize],
      clientSize: content[config.clientSize],
      scrollOffset: content[config.scrollOffset],
      trackSize: this.trackSizes[axis],
    };
  }

  private syncFocusableContent(content: HTMLElement): void {
    const tabindex = this.hostEl.getAttribute('tabindex');

    if (tabindex !== null) {
      if (!content.hasAttribute('tabindex')) {
        content.setAttribute('tabindex', tabindex);
      }

      // Only content is a tab stop: with host as one too, Shift+Tab from content lands on host and
      // onHostFocus sends focus straight back. Read once; later host tabindex changes are not mirrored.
      this.hostEl.setAttribute('tabindex', '-1');
    }
  }

  private cleanup(): void {
    const content = this.contentEl()?.nativeElement;

    content?.removeEventListener('scroll', this.onScroll);
    this.hostEl.removeEventListener('focus', this.onHostFocus);
    this.hostEl.removeEventListener('pointerdown', this.onHostPointerDown, true);
    this.trackYEl()?.nativeElement.removeEventListener('wheel', this.onTrackWheel);
    this.trackXEl()?.nativeElement.removeEventListener('wheel', this.onTrackWheel);
    // After end(): ending a drag starts the idle timer.
    this.dragController.end();
    this.clearIdleTimer();

    this.frames.cancelAll();

    this.contentObserver?.disconnect();
  }
}
