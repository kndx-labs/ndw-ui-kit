import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const DEFAULT_SKELETON_TEXTS = {
  loading: 'Loading table data',
};

/** Relative bar widths, cycled across the columns so rows do not look printed. */
const BAR_WIDTHS = [60, 80, 45, 70, 55];

@Component({
  selector: 'ndwu-table-skeleton',
  exportAs: 'ndwuTableSkeleton',
  template: `
    <div
      class="ndwu-skeleton-table"
      aria-busy="true"
      aria-live="polite"
      [attr.aria-label]="effectiveTexts().loading | localize"
    >
      <div class="ndwu-skeleton-header">
        @for (col of cols(); track col) {
          <div class="ndwu-skeleton-header-cell" [style.flex]="flexFor(col)">
            <div class="ndwu-skeleton-bar ndwu-skeleton-bar--header"></div>
          </div>
        }
      </div>
      @for (row of rowList(); track row) {
        <div class="ndwu-skeleton-row">
          @for (col of cols(); track col) {
            <div class="ndwu-skeleton-cell" [style.flex]="flexFor(col)">
              <div class="ndwu-skeleton-bar" [style.width.%]="barWidth(col)"></div>
            </div>
          }
        </div>
      }
    </div>
  `,
  imports: [LocalizePipe],
  styleUrl: './ndwu-table-skeleton.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ndwu-table-skeleton',
  },
})
export class NdwuTableSkeletonComponent {
  public readonly rows = input(5, {transform: numberAttribute});
  public readonly columns = input(4, {transform: numberAttribute});

  /** CSS widths matching the real table's columns, so swapping in the data causes no layout jump. */
  public readonly columnWidths = input<string[]>([]);

  public readonly skeletonTexts = input<NdwuTableTranslationTexts['skeleton']>();

  protected readonly effectiveTexts = computed(() => ({
    ...DEFAULT_SKELETON_TEXTS,
    ...this.skeletonTexts(),
  }));

  protected readonly rowList = computed(() => Array.from({length: this.rows()}, (_, index) => index));
  protected readonly cols = computed(() => Array.from({length: this.columns()}, (_, index) => index));

  // Mirrors `table-layout: fixed`, which hands leftover width to columns in
  // proportion to their declared width — so grow must be proportional too.
  protected flexFor(col: number): string {
    const width = this.columnWidths()[col];

    if (!width) {
      return '1 1 0';
    }

    return `${parseFloat(width) || 1} 0 ${width}`;
  }

  protected barWidth(col: number): number {
    return BAR_WIDTHS[col % BAR_WIDTHS.length] ?? 60;
  }
}
