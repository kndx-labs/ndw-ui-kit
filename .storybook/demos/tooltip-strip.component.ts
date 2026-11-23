import {ChangeDetectionStrategy, Component, input, signal, viewChild} from '@angular/core';
import {NdwuTooltipDirective} from '@ndw-ui-kit/core';
import type {NdwuPopoverOrigin} from '@ndw-ui-kit/core/popover';

interface StripCell {
  index: number;
  time: string;
  value: number;
}

const STRIP_CELL_COUNT = 48;

const ARROW_STEP: Readonly<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

export type SbTooltipStripMode = 'click' | 'pointer';

function toPoint(event: MouseEvent): NdwuPopoverOrigin {
  return {clientX: event.clientX, clientY: event.clientY};
}

@Component({
  selector: 'sb-tooltip-strip',
  templateUrl: './tooltip-strip.component.html',
  styleUrl: './tooltip-strip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuTooltipDirective],
})
export class SbTooltipStripComponent {
  public readonly mode = input<SbTooltipStripMode>('click');

  protected readonly cells: readonly StripCell[] = Array.from({length: STRIP_CELL_COUNT}, (_, index) => {
    return {
      index,
      time: `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`,
      value: Math.round(50 + 50 * Math.sin(index / 4)),
    };
  });

  protected readonly tooltipCell = signal<StripCell | null>(null);
  protected readonly tooltipOrigin = signal<NdwuPopoverOrigin | null>(null);
  protected readonly focusedIndex = signal(0);

  private readonly tooltip = viewChild.required(NdwuTooltipDirective);

  private hasFocusInStrip = false;

  protected onStripMouseEnter(event: MouseEvent): void {
    if (this.followsPointer()) {
      this.pointAt(event);
      this.tooltip().show();
    }
  }

  protected onStripMouseMove(event: MouseEvent): void {
    if (this.followsPointer()) {
      this.pointAt(event);
    }
  }

  protected onStripMouseLeave(): void {
    if (this.followsPointer()) {
      this.tooltip().hide();
    }
  }

  protected activateCell(cell: StripCell, event: Event): void {
    this.hasFocusInStrip = true;
    this.focusedIndex.set(cell.index);
    this.tooltipCell.set(cell);
    this.tooltipOrigin.set(event.target as Element);
    this.tooltip().show();
  }

  protected onStripFocusOut(event: FocusEvent): void {
    const strip = event.currentTarget as HTMLElement;

    if (!strip.contains(event.relatedTarget as Node | null)) {
      this.hasFocusInStrip = false;
      this.tooltip().hide();
    }
  }

  protected onStripKeydown(event: KeyboardEvent): void {
    const step = ARROW_STEP[event.key] ?? 0;

    if (step === 0) {
      return;
    }

    event.preventDefault();

    const strip = event.currentTarget as HTMLElement;
    const next = Math.min(Math.max(this.focusedIndex() + step, 0), this.cells.length - 1);

    strip.querySelectorAll<HTMLElement>('.strip-cell')[next]?.focus();
  }

  private followsPointer(): boolean {
    return this.mode() === 'pointer' && !this.hasFocusInStrip;
  }

  private pointAt(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const index = Math.floor((event.clientX - rect.left) / rect.width * this.cells.length);

    this.tooltipCell.set(this.cells[Math.min(Math.max(index, 0), this.cells.length - 1)] ?? null);
    this.tooltipOrigin.set(toPoint(event));
  }
}
