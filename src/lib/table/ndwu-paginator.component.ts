import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

export interface NdwuPageEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

const DEFAULT_PAGINATOR_TEXTS = {
  itemsPerPage: 'Items per page',
  range: '{{start}}-{{end}} of {{length}}',
  rangeEmpty: '0 of 0',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
};

@Component({
  selector: 'ndwu-paginator',
  exportAs: 'ndwuPaginator',
  templateUrl: './ndwu-paginator.component.html',
  imports: [LocalizePipe],
  styleUrl: './ndwu-paginator.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ndwu-paginator',
  },
})
export class NdwuPaginatorComponent {
  public readonly pageSizeOptions = input<number[]>([10, 25, 50]);
  public readonly length = input(0);
  public readonly paginatorTexts = input<NdwuTableTranslationTexts['paginator']>();

  // Paging is driven from inside the component as well as from the host, so
  // these are models rather than plain inputs.
  public readonly pageIndex = model(0);
  public readonly pageSize = model(10);

  public readonly page = output<NdwuPageEvent>();

  public readonly totalPages = computed(() => Math.max(1, Math.ceil(this.length() / this.pageSize())));

  /** `pageIndex` can outrun the data when the host shrinks `length` without resetting the page. */
  public readonly currentPage = computed(() =>
    Math.max(0, Math.min(this.pageIndex(), this.totalPages() - 1)),
  );

  public readonly hasPrevious = computed(() => this.currentPage() > 0);
  public readonly hasNext = computed(() => this.currentPage() < this.totalPages() - 1);

  protected readonly effectiveTexts = computed(() => ({
    ...DEFAULT_PAGINATOR_TEXTS,
    ...this.paginatorTexts(),
  }));

  /** Key plus interpolation params, so the host can translate and reorder it. */
  protected readonly rangeLabel = computed<{key: string; params?: Record<string, number>}>(() => {
    const texts = this.effectiveTexts();
    const length = this.length();

    if (length === 0) {
      return {key: texts.rangeEmpty};
    }

    const start = this.currentPage() * this.pageSize() + 1;
    const end = Math.min((this.currentPage() + 1) * this.pageSize(), length);

    return {key: texts.range, params: {start, end, length}};
  });

  public firstPage(): void {
    if (this.hasPrevious()) {
      this.pageIndex.set(0);
      this.emitPageEvent();
    }
  }

  public lastPage(): void {
    if (this.hasNext()) {
      this.pageIndex.set(this.totalPages() - 1);
      this.emitPageEvent();
    }
  }

  public previousPage(): void {
    if (this.hasPrevious()) {
      this.pageIndex.set(this.currentPage() - 1);
      this.emitPageEvent();
    }
  }

  public nextPage(): void {
    if (this.hasNext()) {
      this.pageIndex.set(this.currentPage() + 1);
      this.emitPageEvent();
    }
  }

  public goToPage(index: number): void {
    this.pageIndex.set(index);
    this.emitPageEvent();
  }

  protected onPageSizeChange(event: Event): void {
    const newSize = Number((event.target as HTMLSelectElement).value);

    this.pageSize.set(newSize);
    this.pageIndex.set(0);
    this.emitPageEvent();
  }

  private emitPageEvent(): void {
    this.page.emit({
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      length: this.length(),
    });
  }
}
