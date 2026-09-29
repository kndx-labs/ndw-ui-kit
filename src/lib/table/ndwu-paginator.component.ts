import {ChangeDetectionStrategy, Component, computed, inject, input, model, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE_TOKEN,
  NdwuIconButtonComponent,
  type NdwuOption,
  NdwuSizeDirective,
} from '@ndw-ui-kit/core';
import {NdwuSelectFieldComponent} from '@ndw-ui-kit/core/form-field';
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
  imports: [FormsModule, LocalizePipe, NdwuIconButtonComponent, NdwuSelectFieldComponent],
  styleUrl: './ndwu-paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  providers: [
    {
      provide: NDWU_SIZE_TOKEN,
      useFactory: (sizeDirective: NdwuSizeDirective) => {
        return () => sizeDirective.effectiveSize();
      },
      deps: [NdwuSizeDirective],
    },
  ],
  host: {
    '[class]': 'rootClass()',
  },
})
export class NdwuPaginatorComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  protected readonly rootClass = computed(() => `ndwu-paginator ndwu-paginator--${this.sizeSvc.effectiveSize()}`);

  public readonly pageSizeOptions = input<number[]>([10, 25, 50]);
  public readonly length = input(0);
  public readonly paginatorTexts = input<NdwuTableTranslationTexts['paginator']>();

  public readonly pageIndex = model(0);
  public readonly pageSize = model(10);

  public readonly page = output<NdwuPageEvent>();

  public readonly totalPages = computed(() => Math.max(1, Math.ceil(this.length() / this.pageSize())));

  /** `pageIndex` clamped: it can outrun the data when `length` shrinks. */
  public readonly currentPage = computed(() => {
    return Math.max(0, Math.min(this.pageIndex(), this.totalPages() - 1));
  });

  public readonly hasPrevious = computed(() => this.currentPage() > 0);
  public readonly hasNext = computed(() => this.currentPage() < this.totalPages() - 1);

  protected readonly pageSizeOptionList = computed<NdwuOption[]>(() => {
    return this.pageSizeOptions().map(size => ({value: size, label: `${size}`}));
  });

  protected readonly effectiveTexts = computed(() => {
    return {
      ...DEFAULT_PAGINATOR_TEXTS,
      ...this.paginatorTexts(),
    };
  });

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

  protected onPageSizeChange(value: string | number): void {
    this.pageSize.set(Number(value));
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
