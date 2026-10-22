import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  type OnChanges,
  type SimpleChanges,
  afterRenderEffect,
  computed,
  contentChild,
  effect,
  input,
  isDevMode,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {NdwuTooltipDirective} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {type NdwuPopoverOrigin, NdwuPopoverTriggerDirective} from '@ndw-ui-kit/core/popover';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {
  findInvalidHeatStripLevels,
  heatStripLabelWithMarker,
  heatStripRovingTarget,
  normalizeHeatStripLevel,
  resolveHeatStripKeyIndex,
} from './ndwu-heat-strip.helpers';
import type {
  NdwuHeatStripCell,
  NdwuHeatStripCellLabel,
  NdwuHeatStripLevel,
  NdwuHeatStripMarkerContext,
  NdwuHeatStripTooltipContext,
  NdwuHeatStripTrackBy,
} from './ndwu-heat-strip.types';
import {NdwuHeatStripMarkerDirective, NdwuHeatStripTooltipDirective} from './ndwu-heat-strip-templates.directive';

@Component({
  selector: 'ndwu-heat-strip',
  templateUrl: './ndwu-heat-strip.component.html',
  styleUrl: './ndwu-heat-strip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuLocalizePipe,
    NdwuTooltipDirective,
    NdwuPopoverTriggerDirective,
    NgTemplateOutlet,
  ],
})
export class NdwuHeatStripComponent<T = unknown> implements OnChanges {
  public readonly cells = input.required<readonly NdwuHeatStripCell<T>[]>();

  /** Keys must be unique within one cells array and stable for the same logical cell across updates. */
  public readonly trackBy = input<NdwuHeatStripTrackBy<T>>((index) => {
    return index;
  });

  public readonly axisLabels = input<readonly string[]>([]);
  public readonly loading = input<boolean>(false);
  public readonly ariaLabel = input<string>('Heat strip');
  public readonly cellLabel = input<NdwuHeatStripCellLabel<T> | null>(null);
  public readonly levelLabels = input<readonly string[]>([
    'Level 1',
    'Level 2',
    'Level 3',
    'Level 4',
    'Level 5',
    'Level 6',
  ]);
  public readonly noDataLabel = input<string>('No data');
  public readonly markerLabel = input<string>('Marked');
  public readonly emptyLabel = input<string>('No data');

  protected readonly tabStopIndex = signal<number>(0);
  protected readonly tooltipTargetIndex = signal<number | null>(null);
  protected readonly emptyDescriptionId = uniqueId('ndwu-heat-strip-empty-');
  protected readonly levels = computed(() => {
    return this.cells().map((cell) => normalizeHeatStripLevel(cell.level));
  });
  protected readonly tooltipTemplate = contentChild(NdwuHeatStripTooltipDirective<T>);
  protected readonly markerTemplate = contentChild(NdwuHeatStripMarkerDirective<T>);
  protected readonly stripRef = viewChild<ElementRef<HTMLElement>>('strip');
  protected readonly cellRefs = viewChildren<ElementRef<HTMLElement>>('cell');
  protected readonly tooltip = viewChild(NdwuTooltipDirective);
  protected readonly popoverTrigger = viewChild(NdwuPopoverTriggerDirective);
  protected readonly tooltipIsOpen = computed(() => {
    return this.popoverTrigger()?.isOpen() ?? false;
  });
  protected readonly activeTooltipIndex = computed(() => {
    if (!this.tooltipIsOpen() || this.tooltipTemplate() === undefined) {
      return null;
    }

    return this.tooltipTargetIndex();
  });
  protected readonly tooltipContext = computed<NdwuHeatStripTooltipContext<T> | null>(() => {
    const index = this.tooltipTargetIndex();
    const cell = index === null ? undefined : this.cells()[index];

    if (cell === undefined || index === null) {
      return null;
    }

    return {$implicit: cell, index};
  });
  protected readonly tooltipOrigin = computed<NdwuPopoverOrigin | null>(() => {
    const index = this.tooltipTargetIndex();

    return index === null ? null : this.cellRefs()[index]?.nativeElement ?? null;
  });
  private readonly isTouchDevice = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  private previousCells: readonly NdwuHeatStripCell<T>[] | null = null;
  private wasLoading = false;
  private tabStopKeyDuringLoading: unknown;
  private hasTabStopKeyDuringLoading = false;
  private pointerFocusPending = false;
  private suppressTooltipOnFocus = false;
  private pointerDownTooltipTargetIndex: number | null = null;
  private pendingCellsUpdate: {
    previousCells: readonly NdwuHeatStripCell<T>[];
    tabStopIndex: number;
    tooltipTargetIndex: number | null;
    focusWasOnCell: boolean;
  } | null = null;
  private pendingLoadingUpdate: {
    wasLoading: boolean;
    isLoading: boolean;
    tabStopKey: unknown;
    hasTabStopKey: boolean;
    focusWasOnCell: boolean;
  } | null = null;

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.previousCells !== null && changes['cells']) {
      const activeElement = document.activeElement;

      this.pendingCellsUpdate = {
        previousCells: this.previousCells,
        tabStopIndex: this.tabStopIndex(),
        tooltipTargetIndex: this.tooltipTargetIndex(),
        focusWasOnCell: this.cellRefs().some((cellRef) => cellRef.nativeElement === activeElement),
      };
    }

    if (this.previousCells !== null && changes['loading'] && this.wasLoading !== this.loading()) {
      const tabStopIndex = this.tabStopIndex();
      const tabStopCell = this.previousCells[tabStopIndex];

      this.pendingLoadingUpdate = {
        wasLoading: this.wasLoading,
        isLoading: this.loading(),
        tabStopKey: tabStopCell === undefined ? undefined : this.trackBy()(tabStopIndex, tabStopCell),
        hasTabStopKey: tabStopCell !== undefined,
        focusWasOnCell: this.cellRefs().some((cellRef) => cellRef.nativeElement === document.activeElement),
      };
    }
  }

  constructor() {
    effect(() => this.warnOnInvalidLevels());
    afterRenderEffect(() => this.reconcileCellsAndLoading());

    effect((onCleanup) => {
      const trigger = this.popoverTrigger();

      if (!this.isTouchDevice || !trigger?.isOpen()) {
        return;
      }

      const onPointerDown = (event: PointerEvent): void => {
        const target = event.target;
        const strip = this.stripRef()?.nativeElement;
        const tooltipId = this.tooltip()?.tooltipId;
        const tooltipElement = tooltipId ? document.getElementById(tooltipId) : null;

        if (target instanceof Node && (strip?.contains(target) || tooltipElement?.contains(target))) {
          return;
        }

        this.setTooltipTarget(null);
        this.tooltip()?.hide();
      };

      document.addEventListener('pointerdown', onPointerDown);
      onCleanup(() => {
        document.removeEventListener('pointerdown', onPointerDown);
      });
    });
  }

  protected labelKey(level: NdwuHeatStripLevel | null): string {
    if (level === null) {
      return this.noDataLabel();
    }

    return this.levelLabels()[level] ?? '';
  }

  protected cellAriaLabel(cell: NdwuHeatStripCell<T>, index: number, baseLabel: string, markerText: string): string {
    const customLabel = this.cellLabel();

    if (customLabel !== null) {
      return customLabel(cell, index);
    }

    return heatStripLabelWithMarker(baseLabel, cell.marker === true, markerText);
  }

  protected cellTabIndex(index: number): number {
    if (this.loading()) {
      return -1;
    }

    return index === this.tabStopIndex() ? 0 : -1;
  }

  protected onCellFocus(index: number): void {
    this.tabStopIndex.set(index);

    if (this.suppressTooltipOnFocus) {
      return;
    }

    this.setTooltipTarget(index);

    if (this.pointerFocusPending) {
      return;
    }

    if (this.tooltipTemplate() !== undefined && !this.loading()) {
      this.tooltip()?.show();
    }
  }

  protected onCellPointerDown(index: number): void {
    if (this.isTouchDevice) {
      this.pointerFocusPending = true;
      this.pointerDownTooltipTargetIndex = this.tooltipTargetIndex() ?? index;
    }
  }

  protected onCellPointerEnter(index: number): void {
    if (this.isTouchDevice || this.loading()) {
      return;
    }

    this.setTooltipTarget(index);

    if (this.tooltipTemplate() !== undefined) {
      this.tooltip()?.scheduleShow();
    }
  }

  protected onCellClick(index: number): void {
    const wasPointerFocus = this.pointerFocusPending;

    this.pointerFocusPending = false;

    const targetBeforeClick = wasPointerFocus ? this.pointerDownTooltipTargetIndex : this.tooltipTargetIndex();

    this.pointerDownTooltipTargetIndex = null;

    if (!this.isTouchDevice || this.loading()) {
      return;
    }

    const isSameOpenTarget = this.tooltipIsOpen() && targetBeforeClick === index;

    if (isSameOpenTarget) {
      this.tooltip()?.hide();

      return;
    }

    this.setTooltipTarget(index);

    if (this.tooltipTemplate() !== undefined) {
      this.tooltip()?.show();
    }

    if (!wasPointerFocus && this.tooltipTemplate() === undefined) {
      this.tabStopIndex.set(index);
    }
  }

  protected onStripPointerLeave(): void {
    if (!this.isTouchDevice) {
      this.tooltip()?.scheduleHide();
    }
  }

  protected onStripFocusOut(event: FocusEvent): void {
    const strip = event.currentTarget as HTMLElement;
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && strip.contains(nextTarget)) {
      return;
    }

    this.setTooltipTarget(null);
    this.tooltip()?.hide();
  }

  protected onStripKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.tooltip()?.hide();
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    const strip = event.currentTarget as HTMLElement;
    const activeCellIndex = this.cellRefs().findIndex((cellRef) => cellRef.nativeElement === document.activeElement);
    const currentIndex = activeCellIndex < 0 ? this.tabStopIndex() : activeCellIndex;
    const targetIndex = heatStripRovingTarget(
      currentIndex,
      event.key,
      this.cells().length,
      getComputedStyle(strip).direction === 'rtl',
    );

    if (targetIndex === null) {
      return;
    }

    event.preventDefault();
    this.cellRefs()[targetIndex]?.nativeElement.focus();
  }

  protected onTooltipTargetLost(): void {
    this.tooltip()?.hide();
  }

  protected isCellActive(index: number): boolean {
    return this.activeTooltipIndex() === index;
  }

  protected markerContextForCell(index: number): NdwuHeatStripMarkerContext<T> | null {
    const cell = this.cells()[index];

    if (cell === undefined) {
      return null;
    }

    return {$implicit: cell, index};
  }

  protected setTooltipTarget(index: number | null): void {
    this.tooltipTargetIndex.set(index);
  }

  private warnOnInvalidLevels(): void {
    const invalidIndexes = findInvalidHeatStripLevels(this.cells());

    if (isDevMode() && invalidIndexes.length > 0) {
      console.warn(`Invalid heat strip levels at indexes [${invalidIndexes.join(', ')}]`);
    }
  }

  private reconcileCellsAndLoading(): void {
    const cells = this.cells();
    const trackBy = this.trackBy();
    const loading = this.loading();
    const previousCells = this.previousCells;

    this.previousCells = cells;

    if (previousCells === null) {
      this.wasLoading = loading;

      return;
    }

    const pendingCellsUpdate = this.pendingCellsUpdate;
    const pendingLoadingUpdate = this.pendingLoadingUpdate;

    this.pendingCellsUpdate = null;
    this.pendingLoadingUpdate = null;
    this.wasLoading = loading;

    if (pendingLoadingUpdate?.wasLoading && !pendingLoadingUpdate.isLoading) {
      this.restoreTabStop(cells, trackBy);
    }

    if (previousCells !== cells && pendingCellsUpdate !== null) {
      const oldKeys = pendingCellsUpdate.previousCells.map((cell, index) => {
        return trackBy(index, cell);
      });
      const newKeys = cells.map((cell, index) => {
        return trackBy(index, cell);
      });
      const tabStopKey = oldKeys[pendingCellsUpdate.tabStopIndex];
      const nextTabStop = resolveHeatStripKeyIndex(tabStopKey, newKeys, pendingCellsUpdate.tabStopIndex);
      let nextTabStopIndex = nextTabStop.index;

      if (nextTabStopIndex === -1 && cells.length > 0) {
        nextTabStopIndex = 0;
      }

      this.tabStopIndex.set(Math.max(0, nextTabStopIndex));

      if (pendingCellsUpdate.tooltipTargetIndex !== null) {
        const targetKey = oldKeys[pendingCellsUpdate.tooltipTargetIndex];
        const nextTarget = resolveHeatStripKeyIndex(
          targetKey,
          newKeys,
          pendingCellsUpdate.tooltipTargetIndex,
        );

        if (nextTarget.found) {
          this.setTooltipTarget(nextTarget.index);
        } else {
          this.setTooltipTarget(null);
          this.onTooltipTargetLost();
        }
      }

      if (pendingCellsUpdate.focusWasOnCell) {
        this.focusCellOrStrip(nextTabStopIndex);
      }
    }

    if (pendingLoadingUpdate !== null && !pendingLoadingUpdate.wasLoading && pendingLoadingUpdate.isLoading) {
      this.tabStopKeyDuringLoading = pendingLoadingUpdate.tabStopKey;
      this.hasTabStopKeyDuringLoading = pendingLoadingUpdate.hasTabStopKey;
      this.setTooltipTarget(null);
      this.onTooltipTargetLost();

      if (pendingLoadingUpdate.focusWasOnCell) {
        this.stripRef()?.nativeElement.focus();
      }
    }
  }

  private restoreTabStop(cells: readonly NdwuHeatStripCell<T>[], trackBy: NdwuHeatStripTrackBy<T>): void {
    if (!this.hasTabStopKeyDuringLoading) {
      this.tabStopIndex.set(0);

      return;
    }

    const keys = cells.map((cell, index) => {
      return trackBy(index, cell);
    });
    const restored = resolveHeatStripKeyIndex(this.tabStopKeyDuringLoading, keys, 0);
    const index = restored.found ? restored.index : 0;

    this.tabStopIndex.set(Math.max(0, index));
    this.hasTabStopKeyDuringLoading = false;
    this.tabStopKeyDuringLoading = undefined;
  }

  private focusCellOrStrip(index: number): void {
    if (this.cells().length === 0 || index < 0) {
      this.stripRef()?.nativeElement.focus();

      return;
    }

    const cell = this.cellRefs()[index]?.nativeElement;

    if (cell === undefined) {
      return;
    }

    this.suppressTooltipOnFocus = true;

    try {
      cell.focus();
    } finally {
      this.suppressTooltipOnFocus = false;
    }
  }
}
