import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  type OnDestroy,
  type Signal,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  effect,
  input,
  isDevMode,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';
import {NdwuResizeObserverDirective} from '@ndw-ui-kit/core';
import {blocksToActions} from './utils/schedule-timecoder.utils';
import {blocksToValue, minutesToTime, simplifyBlocks, valueToBlocks} from './layout/schedule-blocks.utils';
import {scheduleLayoutDesktopUtils} from './layout/desktop.schedule-layout';
import {scheduleLayoutMobileUtils} from './layout/mobile.schedule-layout';
import {ScheduleLayout} from './layout/schedule.layout';
import {placeTooltip} from './layout/schedule-tooltip.utils';
import {
  NDWU_SCHEDULE_EDITOR_LAYOUT,
  NDWU_SCHEDULE_EDITOR_MODE,
  NDWU_SCHEDULE_EDITOR_SIZING,
  type NdwuDayName,
  type NdwuScheduleAction,
  NdwuScheduleBlock,
  type NdwuScheduleEditorLayout,
  type NdwuScheduleEditorMode,
  type NdwuScheduleEditorSizing,
  NdwuScheduleTimePoint,
  NdwuScheduleValue,
  type NdwuWeekDay,
} from './schedule-editor.types';
import {NDWU_DAY_TO_NDM_DAY, NDWU_DEFAULT_WEEK_DAYS} from './schedule-editor.constants';
import {
  AxisLabel,
  BlockRect,
  DragPreview,
  DragState,
  GridLine,
  Offset,
  ScheduleEditorOffset,
  Size,
  SlotRect,
  TooltipState,
  TooltipView,
} from './layout/schedule-layout.types';
import {
  BLOCK_DRAG_ADD_CLASS,
  BLOCK_DRAG_REMOVE_CLASS,
  CANVAS_SIZES_DESKTOP,
  CANVAS_SIZES_MOBILE,
  FILL_DESKTOP_MIN_RATIO,
  FILL_DESKTOP_MIN_WIDTH_PX,
  MINUTES_IN_SLOT,
  MIN_GRID_EXTENT_PX,
  NOT_FULL_MODE_TEXT_OFFSET,
  OFFSETS_DESKTOP,
  OFFSETS_MOBILE,
} from './ndwu-schedule-editor.constants';

@Component({
  selector: 'ndwu-schedule-editor',
  host: {
    '[class.ndwu-schedule-editor]': 'true',
    '[class.ndwu-schedule-editor--fill]': 'isFillMode()',
    '[class.ndwu-schedule-editor--scale]': 'isScaleMode()',
  },
  templateUrl: './ndwu-schedule-editor.component.html',
  styleUrls: ['./ndwu-schedule-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NdwuResizeObserverDirective],
})
export class NdwuScheduleEditorComponent implements OnDestroy {
  public readonly value = input<NdwuScheduleValue>({});
  public readonly forceLayout = input<NdwuScheduleEditorLayout | null>(null);
  public readonly mode = input<NdwuScheduleEditorMode>(NDWU_SCHEDULE_EDITOR_MODE.FULL);
  public readonly sizing = input<NdwuScheduleEditorSizing>(NDWU_SCHEDULE_EDITOR_SIZING.SCALE);
  public readonly weekDays = input(
    NDWU_DEFAULT_WEEK_DAYS,
    {transform: (value: NdwuWeekDay[] | null | undefined) => value ?? NDWU_DEFAULT_WEEK_DAYS},
  );

  public readonly valueChange = output<NdwuScheduleValue>();
  public readonly actionsChange = output<NdwuScheduleAction[]>();

  private readonly weekDayLabels: Signal<Partial<Record<NdwuDayName, string>>> = computed(() => {
    return Object.fromEntries(this.weekDays().map((wd) => [wd.day, wd.label]));
  });

  private readonly effectiveLayout: Signal<NdwuScheduleEditorLayout> = computed(() => {
    const force = this.forceLayout();

    if (force) {
      return force;
    }

    if (this.isMobileScreen()) {
      return NDWU_SCHEDULE_EDITOR_LAYOUT.MOBILE;
    }

    const measured = this.isFillMode() ? this.measuredCanvasSize() : null;

    if (measured && measured?.height > 0) {
      const ratio = measured.width / measured.height;
      const isDesktopShaped = ratio >= FILL_DESKTOP_MIN_RATIO
        && measured.width >= FILL_DESKTOP_MIN_WIDTH_PX;

      return isDesktopShaped ? NDWU_SCHEDULE_EDITOR_LAYOUT.DESKTOP : NDWU_SCHEDULE_EDITOR_LAYOUT.MOBILE;
    }

    return NDWU_SCHEDULE_EDITOR_LAYOUT.DESKTOP;
  });

  private readonly isMobileScreen: Signal<boolean>;

  private readonly isDesktopLayout: Signal<boolean> = computed(() => {
    return this.effectiveLayout() !== NDWU_SCHEDULE_EDITOR_LAYOUT.MOBILE;
  });

  private readonly scheduleLayout: Signal<ScheduleLayout> = computed(() => {
    return this.isDesktopLayout() ? scheduleLayoutDesktopUtils : scheduleLayoutMobileUtils;
  });

  protected readonly layoutOffset: Signal<ScheduleEditorOffset> = computed(() => {
    const offsets = this.isDesktopLayout() ? OFFSETS_DESKTOP : OFFSETS_MOBILE;

    return offsets[this.mode()];
  });

  private readonly wrapperResize = viewChild(NdwuResizeObserverDirective);
  private readonly wrapperElement = viewChild.required<ElementRef<HTMLElement>>('wrapperElement');

  private readonly baseCanvasSize = computed(() => {
    const sizes = this.isDesktopLayout() ? CANVAS_SIZES_DESKTOP : CANVAS_SIZES_MOBILE;

    return sizes[this.mode()];
  });

  private readonly measuredCanvasSize = computed(() => {
    const observer = this.wrapperResize();

    if (!observer?.measured()) {
      return null;
    }

    return {
      width: Math.round(observer.width()),
      height: Math.round(observer.height()),
    };
  });

  private readonly renderCanvasSize = computed(() => {
    if (!this.isFillMode()) {
      return this.baseCanvasSize();
    }

    return this.measuredCanvasSize() ?? this.baseCanvasSize();
  });

  protected readonly gridWidth = computed(() => {
    const offset = this.layoutOffset();
    const extent = this.renderCanvasSize().width - (offset.left + offset.right);

    return Math.max(extent, MIN_GRID_EXTENT_PX);
  });

  protected readonly gridHeight = computed(() => {
    const offset = this.layoutOffset();
    const extent = this.renderCanvasSize().height - (offset.top + offset.bottom);

    return Math.max(extent, MIN_GRID_EXTENT_PX);
  });

  private readonly scheduleBlocks: Signal<NdwuScheduleBlock[]> = computed(() => {
    return simplifyBlocks(valueToBlocks(this.value(), this.weekDays()));
  });

  protected readonly isFullMode = computed(() => {
    return this.mode() === NDWU_SCHEDULE_EDITOR_MODE.FULL;
  });

  protected readonly isScaleMode = computed(() => {
    return this.sizing() === NDWU_SCHEDULE_EDITOR_SIZING.SCALE;
  });

  private readonly isUnsupportedFillMode = computed(() => {
    return this.sizing() === NDWU_SCHEDULE_EDITOR_SIZING.FILL
      && this.mode() === NDWU_SCHEDULE_EDITOR_MODE.THUMBNAIL;
  });

  protected readonly isFillMode = computed(() => {
    return this.sizing() === NDWU_SCHEDULE_EDITOR_SIZING.FILL && !this.isUnsupportedFillMode();
  });

  protected readonly svgViewBox: Signal<string> = computed(() => {
    const canvasWidth = this.renderCanvasSize().width;
    const canvasHeight = this.renderCanvasSize().height;

    if (this.isFillMode()) {
      return `0 0 ${canvasWidth} ${canvasHeight}`;
    }

    const textOffset = this.isFullMode() ? 0 : NOT_FULL_MODE_TEXT_OFFSET;
    const viewBoxShift = this.layoutOffset().viewBoxShift ?? {x: 0, y: 0};

    return [
      viewBoxShift.x,
      viewBoxShift.y,
      canvasWidth + viewBoxShift.x,
      canvasHeight + viewBoxShift.y + textOffset,
    ]
      .join(' ');
  });

  protected readonly svgClasses: Signal<string> = computed(() => {
    const chunks = [
      `ndwu-schedule-editor--${this.mode()}`,
      'ndwu-schedule-editor__svg',
    ];

    if (this.isFillMode()) {
      chunks.push('ndwu-schedule-editor__svg--fill');
    }

    if (this.isScaleMode()) {
      chunks.push('ndwu-schedule-editor__svg--scale');
    }

    const base = chunks.join(' ');

    return this.dragState() !== null ? `${base} ndwu-schedule-editor--dragging` : base;
  });

  protected readonly svgWidth: Signal<number | null> = computed(() => {
    return this.isFillMode()
      ? null
      : this.renderCanvasSize().width;
  });

  protected readonly svgHeight: Signal<number | null> = computed(() => {
    return this.isFillMode()
      ? null
      : this.renderCanvasSize().height;
  });

  protected readonly gridLines: Signal<GridLine[]> = computed(() => {
    return this.scheduleLayout().getGridLines({
      isFull: this.isFullMode(),
      offset: this.layoutOffset(),
      gridWidth: this.gridWidth(),
      gridHeight: this.gridHeight(),
    });
  });

  protected readonly slotRects: Signal<SlotRect[]> = computed(() => {
    if (!this.isFullMode()) {
      return [];
    }

    return this.scheduleLayout().getSlotRects({
      offset: this.layoutOffset(),
      gridWidth: this.gridWidth(),
      gridHeight: this.gridHeight(),
      weekDays: this.weekDays(),
      blocks: this.scheduleBlocks(),
    });
  });

  protected readonly blockRects: Signal<BlockRect[]> = computed(() => {
    return this.scheduleLayout().getBlockRects({
      isFull: this.isFullMode(),
      offset: this.layoutOffset(),
      gridWidth: this.gridWidth(),
      gridHeight: this.gridHeight(),
      weekDays: this.weekDays(),
      blocks: this.scheduleBlocks(),
    });
  });

  protected readonly gridBorderRect = computed(() => {
    return {
      offset: this.layoutOffset(),
      gridWidth: this.gridWidth(),
      gridHeight: this.gridHeight(),
    };
  });

  protected readonly axisLabels: Signal<AxisLabel[]> = computed(() => {
    return this.scheduleLayout().getAxesText({
      isFullMode: this.isFullMode(),
      weekDays: this.weekDays(),
      weekdayLabels: this.weekDayLabels(),
      offset: this.layoutOffset(),
      gridWidth: this.gridWidth(),
      gridHeight: this.gridHeight(),
    });
  });

  protected readonly dragPreview: Signal<DragPreview | null> = computed(() => {
    const drag = this.dragState();

    if (!drag) {
      return null;
    }

    const rect = this.scheduleLayout().generateBlockFromPoints({
      p1: drag.start,
      p2: drag.end,
      offset: this.layoutOffset(),
      gridWidth: this.gridWidth(),
      gridHeight: this.gridHeight(),
      canvasWidth: this.renderCanvasSize().width,
    });

    return {
      rect,
      cssClass: drag.removing ? BLOCK_DRAG_REMOVE_CLASS : BLOCK_DRAG_ADD_CLASS,
    };
  });

  private readonly dragState = signal<DragState | null>(null);

  private hasWarnedZeroSize = false;
  private hasErroredUnsupportedFillMode = false;

  protected readonly tooltip = signal<TooltipState | null>(null);

  private readonly tooltipElement = viewChild<ElementRef<HTMLElement>>('tooltipElement');

  private readonly tooltipText = computed(() => this.tooltip()?.text ?? null);

  private readonly tooltipSize = signal<Size>({width: 0, height: 0}, {
    equal: (a, b) => a.width === b.width && a.height === b.height,
  });

  private readonly tooltipBounds: Signal<Size> = computed(() => {
    const wrapper = this.wrapperResize();

    if (!wrapper?.measured()) {
      return {width: Infinity, height: Infinity};
    }

    if (this.isFillMode() || this.isScaleMode()) {
      return {width: wrapper.width(), height: wrapper.height()};
    }

    const canvas = this.renderCanvasSize();

    return {width: Math.max(wrapper.width(), canvas.width), height: wrapper.height()};
  });

  protected readonly tooltipView: Signal<TooltipView | null> = computed(() => {
    const tooltip = this.tooltip();

    if (!tooltip) {
      return null;
    }

    return {
      text: tooltip.text,
      ...placeTooltip(tooltip.anchor, this.tooltipSize(), this.tooltipBounds()),
    };
  });

  protected readonly measureTooltip = afterRenderEffect({
    read: () => {
      this.tooltipText();

      const rect = this.tooltipElement()?.nativeElement.getBoundingClientRect();

      if (rect) {
        this.tooltipSize.set({width: Math.ceil(rect.width), height: Math.ceil(rect.height)});
      }
    },
  });

  constructor(
    private breakpointObserver: BreakpointObserver,
    private elementRef: ElementRef<HTMLElement>,
  ) {
    this.isMobileScreen = toSignal(
      this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
      {initialValue: this.breakpointObserver.isMatched(Breakpoints.Handset)},
    );

    effect(() => {
      if (!isDevMode() || !this.isFillMode() || this.hasWarnedZeroSize) {
        return;
      }

      const measured = this.measuredCanvasSize();

      if (!measured || (measured.width > 0 && measured.height > 0)) {
        return;
      }

      this.hasWarnedZeroSize = true;

      console.warn(
        '[ndwu-schedule-editor] sizing="fill" measured a zero dimension. Give the parent element a resolved height.',
      );
    });

    effect(() => {
      if (!this.isUnsupportedFillMode() || this.hasErroredUnsupportedFillMode) {
        return;
      }

      this.hasErroredUnsupportedFillMode = true;

      console.error(
        '[ndwu-schedule-editor] sizing="fill" is not supported with mode="thumbnail". Falling back to fixed sizing.',
      );
    });
  }

  public ngOnDestroy(): void {
    this.detachGlobalListeners();
  }

  private readonly onGlobalPointerUp = (): void => {
    this.onPointerUp();
  };

  private attachGlobalListeners(): void {
    const doc = this.elementRef.nativeElement.ownerDocument || document;

    doc.addEventListener('mouseup', this.onGlobalPointerUp);
    doc.addEventListener('touchend', this.onGlobalPointerUp);
  }

  private detachGlobalListeners(): void {
    const doc = this.elementRef.nativeElement.ownerDocument || document;

    doc.removeEventListener('mouseup', this.onGlobalPointerUp);
    doc.removeEventListener('touchend', this.onGlobalPointerUp);
  }

  protected onSlotPointerDown(event: MouseEvent | TouchEvent, slot: SlotRect): void {
    if ('button' in event && event.button) {
      return;
    }

    event.preventDefault();

    const point: NdwuScheduleTimePoint = {gridTime: slot.slotIndex * MINUTES_IN_SLOT, gridDay: slot.dayIndex};

    const drag: DragState = {
      start: point,
      end: point,
      removing: this.isTimeOccupied(this.scheduleBlocks(), point, this.weekDays()),
    };

    this.dragState.set(drag);
    this.attachGlobalListeners();
    this.showDragTooltip(event, drag);
  }

  protected onPointerMove(event: MouseEvent | TouchEvent): void {
    const drag = this.dragState();

    if (!drag) {
      return;
    }

    event.preventDefault();

    const point = this.pointerToTimeSlot(event);
    const nextDrag = point ? {...drag, end: point} : drag;

    if (point) {
      this.dragState.set(nextDrag);
    }

    this.showDragTooltip(event, nextDrag);
  }

  protected onPointerUp(): void {
    this.detachGlobalListeners();

    if (!this.dragState()) {
      return;
    }

    this.finalizeDrag();
  }

  protected onSlotHover(event: MouseEvent, slot: SlotRect): void {
    if (this.dragState()) {
      return;
    }

    this.showSlotTooltip(event, slot);
  }

  protected onSlotMouseMove(event: MouseEvent, _slot: SlotRect): void {
    if (this.dragState()) {
      return;
    }

    this.updateTooltipAnchor(event);
  }

  protected onSlotMouseLeave(): void {
    if (this.dragState()) {
      return;
    }

    this.tooltip.set(null);
  }

  protected onSvgMouseLeave(): void {
    this.tooltip.set(null);
  }

  private finalizeDrag(): void {
    const drag = this.dragState();

    this.dragState.set(null);

    if (!drag) {
      return;
    }

    const updated = this.scheduleLayout().applyChange({
      blocks: this.scheduleBlocks(),
      p1: drag.start,
      p2: drag.end,
      weekDays: this.weekDays(),
      isRemove: drag.removing,
    });

    this.valueChange.emit(blocksToValue(updated, this.weekDays()));
    this.actionsChange.emit(blocksToActions(updated));
  }

  private isTimeOccupied(
    blocks: NdwuScheduleBlock[],
    point: NdwuScheduleTimePoint,
    weekDays: NdwuWeekDay[],
  ): boolean {
    const dayOfWeek = weekDays[point.gridDay];

    if (!dayOfWeek) {
      return false;
    }

    return blocks.some((block) => {
      return block.day === NDWU_DAY_TO_NDM_DAY[dayOfWeek.day]
        && block.start <= point.gridTime
        && block.stop > point.gridTime;
    });
  }

  private showSlotTooltip(event: MouseEvent, slot: SlotRect): void {
    const startMin = slot.slotIndex * MINUTES_IN_SLOT;
    const endMin = startMin + MINUTES_IN_SLOT;
    const anchor = this.getTooltipAnchor(event);

    if (!anchor) {
      return;
    }

    this.tooltip.set({
      text: `${minutesToTime(startMin)} – ${minutesToTime(endMin)}`,
      anchor,
    });
  }

  private updateTooltipAnchor(event: MouseEvent): void {
    const tooltip = this.tooltip();
    const anchor = this.getTooltipAnchor(event);

    if (!tooltip || !anchor) {
      return;
    }

    this.tooltip.set({...tooltip, anchor});
  }

  private showDragTooltip(event: MouseEvent | TouchEvent, drag: DragState): void {
    const anchor = this.getTooltipAnchor(event);

    if (!anchor) {
      return;
    }

    const {startTime, endTime} = this.scheduleLayout().normalizePointsArea(drag.start, drag.end);

    this.tooltip.set({
      text: `${minutesToTime(startTime)} – ${minutesToTime(endTime)}`,
      anchor,
    });
  }

  private getTooltipAnchor(event: MouseEvent | TouchEvent): Offset | null {
    const clientPoint = this.getEventClientPoint(event);

    if (!clientPoint) {
      return null;
    }

    const rect = this.wrapperElement().nativeElement.getBoundingClientRect();

    return {
      x: clientPoint.clientX - rect.left,
      y: clientPoint.clientY - rect.top,
    };
  }

  private getEventClientPoint(event: MouseEvent | TouchEvent): {clientX: number; clientY: number} | null {
    if ('changedTouches' in event) {
      const touch = event.changedTouches[0] ?? event.touches[0];

      return touch ? {clientX: touch.clientX, clientY: touch.clientY} : null;
    }

    return {clientX: event.clientX, clientY: event.clientY};
  }

  private pointerToTimeSlot(event: MouseEvent | TouchEvent): NdwuScheduleTimePoint | null {
    let clientX: number, clientY: number;
    let target: EventTarget | null;

    if ('changedTouches' in event) {
      const touch = event.changedTouches[0];

      if (!touch) {
        return null;
      }

      clientX = touch.clientX;
      clientY = touch.clientY;
      target = event.target;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
      target = event.target;
    }

    const svg = (target as Element)?.closest('svg');

    if (!svg) {
      return null;
    }

    const ctm = svg.getScreenCTM();

    if (!ctm) {
      return null;
    }

    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());

    return this.scheduleLayout().coordsToTimeSlot({
      svgPoint: {x: pt.x, y: pt.y},
      offset: this.layoutOffset(),
      canvasWidth: this.renderCanvasSize().width,
      gridWidth: this.gridWidth(),
      gridHeight: this.gridHeight(),
    });
  }
}
