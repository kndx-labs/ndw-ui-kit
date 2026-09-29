import {ChangeDetectionStrategy, Component, computed, input, numberAttribute} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const DEFAULT_SKELETON_TEXTS = {
  loading: 'Loading table data',
};

const BAR_WIDTHS = [60, 80, 45, 70, 55];

@Component({
  selector: 'ndwu-table-skeleton',
  exportAs: 'ndwuTableSkeleton',
  templateUrl: './ndwu-table-skeleton.component.html',
  imports: [LocalizePipe],
  styleUrl: './ndwu-table-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ndwu-table-skeleton',
  },
})
export class NdwuTableSkeletonComponent {
  public readonly rows = input(5, {transform: numberAttribute});
  public readonly columns = input(4, {transform: numberAttribute});

  public readonly columnWidths = input<string[]>([]);

  public readonly skeletonTexts = input<NdwuTableTranslationTexts['skeleton']>();

  protected readonly effectiveTexts = computed(() => {
    return {
      ...DEFAULT_SKELETON_TEXTS,
      ...this.skeletonTexts(),
    };
  });

  protected readonly rowList = computed(() => Array.from({length: this.rows()}, (_, index) => index));
  protected readonly cols = computed(() => Array.from({length: this.columns()}, (_, index) => index));

  // Proportional, as `table-layout: fixed` hands out leftover width.
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
