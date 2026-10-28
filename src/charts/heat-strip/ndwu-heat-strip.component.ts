import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  contentChild,
  effect,
  input,
  isDevMode,
  linkedSignal,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {NdwuTooltipDirective} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {type NdwuPopoverOrigin, NdwuPopoverTriggerDirective} from '@ndw-ui-kit/core/popover';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {
  clampHeatStripIndex,
  findInvalidHeatStripLevels,
  heatStripLabelWithMarker,
  heatStripRovingTarget,
  normalizeHeatStripLevel,
  resolveHeatStripTooltipTarget,
} from './ndwu-heat-strip.helpers';
import type {
  NdwuHeatStripCell,
  NdwuHeatStripCellLabel,
  NdwuHeatStripLevel,
  NdwuHeatStripTooltipContext,
} from './ndwu-heat-strip.types';
import {NdwuHeatStripMarkerDirective, NdwuHeatStripTooltipDirective} from './ndwu-heat-strip-templates.directive';

interface HeatStripLengthAndLoading {
  length: number;
  loading: boolean;
}

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
export class NdwuHeatStripComponent<T = unknown> {
  public readonly cells = input.required<readonly NdwuHeatStripCell<T>[]>();
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

  private readonly lengthAndLoading = computed(() => {
    return {length: this.cells().length, loading: this.loading()};
  });
  private readonly lastFocusedIndex = signal<number>(0);
  protected readonly tabStopIndex = computed(() => {
    return clampHeatStripIndex(this.lastFocusedIndex(), this.cells().length);
  });
  protected readonly tooltipTargetIndex = linkedSignal<HeatStripLengthAndLoading, number | null>({
    source: this.lengthAndLoading,
    computation: (source, previous) => {
      return resolveHeatStripTooltipTarget(previous?.value ?? null, source.length, source.loading);
    },
  });
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

  constructor() {
    effect(() => this.warnOnInvalidLevels());
    effect(() => {
      if (this.tooltipTargetIndex() === null) {
        untracked(() => this.tooltip()?.hide());
      }
    });
    afterRenderEffect(() => {
      const {loading} = this.lengthAndLoading();

      if (!loading) {
        return;
      }

      const activeElement = document.activeElement;
      const activeCell = this.cellRefs().some((cellRef) => cellRef.nativeElement === activeElement);

      if (activeCell) {
        this.stripRef()?.nativeElement.focus();
      }
    });

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

        this.tooltipTargetIndex.set(null);
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
    if (this.loading()) {
      return;
    }

    this.lastFocusedIndex.set(index);

    if (this.isTouchDevice) {
      return;
    }

    this.tooltipTargetIndex.set(index);

    if (this.tooltipTemplate() !== undefined) {
      this.tooltip()?.show();
    }
  }

  protected onCellPointerEnter(index: number): void {
    if (this.isTouchDevice || this.loading()) {
      return;
    }

    this.tooltipTargetIndex.set(index);

    if (this.tooltipTemplate() !== undefined) {
      this.tooltip()?.scheduleShow();
    }
  }

  protected onCellClick(index: number): void {
    if (!this.isTouchDevice || this.loading()) {
      return;
    }

    const isSameOpenTarget = this.tooltipIsOpen() && this.tooltipTargetIndex() === index;

    if (isSameOpenTarget) {
      this.tooltip()?.hide();

      return;
    }

    this.tooltipTargetIndex.set(index);

    if (this.tooltipTemplate() !== undefined) {
      this.tooltip()?.show();
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

    this.tooltipTargetIndex.set(null);
  }

  protected onStripKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.tooltip()?.hide();
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    if (this.loading()) {
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

  protected isCellActive(index: number): boolean {
    return this.activeTooltipIndex() === index;
  }

  private warnOnInvalidLevels(): void {
    const invalidIndexes = findInvalidHeatStripLevels(this.cells());

    if (isDevMode() && invalidIndexes.length > 0) {
      console.warn(`Invalid heat strip levels at indexes [${invalidIndexes.join(', ')}]`);
    }
  }
}
