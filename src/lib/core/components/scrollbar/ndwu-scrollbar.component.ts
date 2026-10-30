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
import {calculateThumbOffset, calculateThumbSize, convertTrackToScroll, hasOverflow} from './ndwu-scrollbar.geometry';
import {NdwuScrollbarDragController} from './ndwu-scrollbar-drag.controller';
import {NdwuScrollbarContentObserver} from './ndwu-scrollbar.content-observer';
import {NdwuFrameScheduler} from './ndwu-scrollbar.frame-scheduler';
import {
  DEFAULT_MIN_THUMB_SIZE,
  type NdwuBoxSize,
  clearContentBoxSize,
  measureTrackSize,
  parseMinThumbSize,
  syncContentBoxSize,
} from './ndwu-scrollbar.dom';

const MIN_THUMB_SIZE_PROPERTY = '--ndwu-scrollbar-min-thumb-size';

const SCROLLABLE_Y_CLASS = 'ndwu-scrollbar--scrollable-y';
const SCROLLABLE_X_CLASS = 'ndwu-scrollbar--scrollable-x';

// Only the mouse drags the custom thumb and clicks the track; touch and pen use native scrolling.
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
    '[style.--ndwu-scrollbar-padding-left]': 'ndwuScrollbarPadding().left',
    '[style.--ndwu-scrollbar-padding-right]': 'ndwuScrollbarPadding().right',
    '[style.--ndwu-scrollbar-padding-top]': 'ndwuScrollbarPadding().top',
    '[style.--ndwu-scrollbar-padding-bottom]': 'ndwuScrollbarPadding().bottom',
    '[style.--ndwu-scrollbar-content-padding-left]': 'ndwuScrollbarContentPadding().left',
    '[style.--ndwu-scrollbar-content-padding-right]': 'ndwuScrollbarContentPadding().right',
    '[style.--ndwu-scrollbar-content-padding-top]': 'ndwuScrollbarContentPadding().top',
    '[style.--ndwu-scrollbar-content-padding-bottom]': 'ndwuScrollbarContentPadding().bottom',
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
      thumbStyle: 'height',
      translateAxis: (v: number) => `translate3d(0, ${v}px, 0)`,
    },
    x: {
      contentSize: 'scrollWidth',
      clientSize: 'clientWidth',
      scrollOffset: 'scrollLeft',
      pointerCoord: 'clientX',
      rectStart: 'left',
      thumbStyle: 'width',
      translateAxis: (v: number) => `translate3d(${v}px, 0, 0)`,
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

  protected readonly isDragging = signal(false);
  protected readonly isViewInitialized = signal(false);
  protected readonly normalizedSize = computed(() => {
    return this.ndwuScrollbarSize() === NDWU_SIZE.XL ? NDWU_SIZE.XL : NDWU_SIZE.L;
  });

  private readonly dragController = new NdwuScrollbarDragController(
    this.doc,
    {
      move: (state, event) => this.onDragMove(state, event),
      activeChange: (isActive) => this.isDragging.set(isActive),
    },
  );

  private minThumbSize = DEFAULT_MIN_THUMB_SIZE;
  private lastContentSize: NdwuBoxSize = {width: 0, height: 0};
  private readonly overflow: Record<NdwuScrollbarAxis, boolean> = {x: false, y: false};
  private readonly frames = new NdwuFrameScheduler<'recalculate' | 'position'>();
  private contentObserver: NdwuScrollbarContentObserver | null = null;

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
        this.dragController.end();
        this.releaseContentBoxSize();

        return;
      }

      this.contentObserver?.reobserveHost();
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
    if (this.isDragging()) {
      return;
    }

    this.schedulePositionUpdate();
  };

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
    if (!this.claimMousePointer(event)) {
      return;
    }

    this.startDrag(axis, event);
  }

  protected onTrackPointerDown(axis: NdwuScrollbarAxis, event: PointerEvent): void {
    if (!this.claimMousePointer(event)) {
      return;
    }

    this.startTrackClick(axis, event);
  }

  // Takes over a mouse pointerdown; touch and pen are left to native scrolling.
  private claimMousePointer(event: PointerEvent): boolean {
    if (event.pointerType !== SUPPORTED_POINTER_TYPE) {
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

  private startDrag(axis: NdwuScrollbarAxis, event: PointerEvent): void {
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
    const pointerPosition = this.getPointerOffset(state.axis, event);

    this.scrollThumbTo(state.axis, pointerPosition - state.trackStart - state.pointerOffset);
  }

  // Centers the thumb on the clicked point.
  private startTrackClick(axis: NdwuScrollbarAxis, event: PointerEvent): void {
    const {track} = this.getAxisElements(axis);
    const trackStart = this.getRectStart(axis, track.getBoundingClientRect());
    const thumbSize = calculateThumbSize(this.getAxisMetrics(axis), this.minThumbSize);
    const pointerPosition = this.getPointerOffset(axis, event);

    this.scrollThumbTo(axis, pointerPosition - trackStart - (thumbSize / 2));
  }

  // Scrolls the content so that the thumb starts at `thumbStart`, counted from the track start.
  // The browser clamps the scroll offset itself.
  private scrollThumbTo(axis: NdwuScrollbarAxis, thumbStart: number): void {
    const metrics = this.getAxisMetrics(axis);
    const thumbSize = calculateThumbSize(metrics, this.minThumbSize);
    const scrollOffsetKey = this.getConfig(axis).scrollOffset;

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
    const styleKey = this.getConfig(axis).thumbStyle;

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
    this.getAxisElements(axis).thumb.style.transform = this.getConfig(axis).translateAxis(offset);
  }

  private getAxisMetrics(axis: NdwuScrollbarAxis): NdwuAxisMetrics {
    const content = this.contentEl().nativeElement;
    const config = this.getConfig(axis);
    const {track} = this.getAxisElements(axis);

    return {
      contentSize: content[config.contentSize],
      clientSize: content[config.clientSize],
      scrollOffset: content[config.scrollOffset],
      trackSize: measureTrackSize(getComputedStyle(track), config.thumbStyle),
    };
  }

  private getPointerOffset(axis: NdwuScrollbarAxis, event: MouseEvent | PointerEvent): number {
    return event[this.getConfig(axis).pointerCoord];
  }

  private getRectStart(axis: NdwuScrollbarAxis, rect: DOMRect): number {
    return rect[this.getConfig(axis).rectStart];
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

    this.frames.cancelAll();

    this.contentObserver?.disconnect();
  }
}
