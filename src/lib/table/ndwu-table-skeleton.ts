import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  signal,
  computed,
} from '@angular/core';

@Component({
  selector: 'ndwu-table-skeleton',
  exportAs: 'ndwuTableSkeleton',
  template: `
    <div class="ndwu-skeleton-table" aria-busy="true" aria-live="polite" aria-label="Loading table data">
      <div class="ndwu-skeleton-header">
        @for (col of _cols(); track col) {
          <div class="ndwu-skeleton-header-cell" [style.flex]="_flexFor(col)">
            <div class="ndwu-skeleton-bar ndwu-skeleton-bar--header"></div>
          </div>
        }
      </div>
      @for (row of _rows(); track row) {
        <div class="ndwu-skeleton-row">
          @for (col of _cols(); track col) {
            <div class="ndwu-skeleton-cell" [style.flex]="_flexFor(col)">
              <div class="ndwu-skeleton-bar" [style.width.%]="_widths[col % _widths.length]"></div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './ndwu-table-skeleton.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ndwu-table-skeleton',
  },
})
export class NdwuTableSkeleton {
  private readonly _rowCount = signal(5);
  private readonly _colCount = signal(4);

  @Input()
  set rows(value: number) { this._rowCount.set(value); }
  get rows(): number { return this._rowCount(); }

  @Input()
  set columns(value: number) { this._colCount.set(value); }
  get columns(): number { return this._colCount(); }

  /** CSS widths matching the real table's columns, so swapping in the data causes no layout jump. */
  @Input() columnWidths: string[] = [];

  readonly _widths = [60, 80, 45, 70, 55];

  readonly _rows = computed(() => Array.from({length: this._rowCount()}, (_, i) => i));
  readonly _cols = computed(() => Array.from({length: this._colCount()}, (_, i) => i));

  // Mirrors `table-layout: fixed`, which hands leftover width to columns in
  // proportion to their declared width — so grow must be proportional too.
  _flexFor(col: number): string {
    const width = this.columnWidths[col];
    if (!width) return '1 1 0';
    return `${parseFloat(width) || 1} 0 ${width}`;
  }
}
