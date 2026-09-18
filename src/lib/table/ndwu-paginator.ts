import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  input,
} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import type {TranslationTexts} from './ndwu-table.types';

export interface NdwuPageEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

@Component({
  selector: 'ndwu-paginator',
  exportAs: 'ndwuPaginator',
  template: `
    @if (pageSizeOptions.length > 1) {
      <label class="ndwu-paginator-size">
        <span class="ndwu-paginator-size-label">{{ effectiveTexts().itemsPerPage | localize }}</span>
        <select
          class="ndwu-paginator-select"
          [value]="_pageSize()"
          (change)="onPageSizeChange($event)"
        >
          @for (size of pageSizeOptions; track size) {
            <option [value]="size">{{ size }}</option>
          }
        </select>
      </label>
    }
    <div class="ndwu-paginator-range">
      {{ rangeLabel().key | localize: rangeLabel().params }}
    </div>
    <div class="ndwu-paginator-controls">
      <button
        class="ndwu-paginator-btn"
        [disabled]="!hasPrevious()"
        (click)="firstPage()"
        [attr.aria-label]="effectiveTexts().firstPage | localize"
      >&#x21E4;</button>
      <button
        class="ndwu-paginator-btn"
        [disabled]="!hasPrevious()"
        (click)="previousPage()"
        [attr.aria-label]="effectiveTexts().previousPage | localize"
      >&#x2039;</button>
      <button
        class="ndwu-paginator-btn"
        [disabled]="!hasNext()"
        (click)="nextPage()"
        [attr.aria-label]="effectiveTexts().nextPage | localize"
      >&#x203A;</button>
      <button
        class="ndwu-paginator-btn"
        [disabled]="!hasNext()"
        (click)="lastPage()"
        [attr.aria-label]="effectiveTexts().lastPage | localize"
      >&#x21E5;</button>
    </div>
  `,
  imports: [LocalizePipe],
  styleUrl: './ndwu-paginator.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ndwu-paginator',
  },
})
export class NdwuPaginatorComponent {
  private readonly DEFAULT_PAGINATOR_TEXTS = {
    itemsPerPage: 'Items per page',
    range: '{{start}}-{{end}} of {{length}}',
    rangeEmpty: '0 of 0',
    firstPage: 'First page',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    lastPage: 'Last page',
  };

  readonly paginatorTexts = input<TranslationTexts['paginator']>();

  protected readonly effectiveTexts = computed(() => ({
    ...this.DEFAULT_PAGINATOR_TEXTS,
    ...this.paginatorTexts(),
  }));

  readonly _pageIndex = signal(0);
  readonly _pageSize = signal(10);
  readonly _length = signal(0);

  @Input() pageSizeOptions: number[] = [10, 25, 50];

  @Input()
  set pageIndex(value: number) { this._pageIndex.set(value); }
  get pageIndex(): number { return this._pageIndex(); }

  @Input()
  set pageSize(value: number) { this._pageSize.set(value); }
  get pageSize(): number { return this._pageSize(); }

  @Input()
  set length(value: number) { this._length.set(value); }
  get length(): number { return this._length(); }

  @Output() readonly page = new EventEmitter<NdwuPageEvent>();

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this._length() / this._pageSize())));

  /** `pageIndex` can outrun the data when the host shrinks `length` without resetting the page. */
  readonly currentPage = computed(() =>
    Math.max(0, Math.min(this._pageIndex(), this.totalPages() - 1)),
  );

  readonly hasPrevious = computed(() => this.currentPage() > 0);
  readonly hasNext = computed(() => this.currentPage() < this.totalPages() - 1);

  /** Key plus interpolation params, so the host can translate and reorder it. */
  readonly rangeLabel = computed<{key: string; params?: Record<string, number>}>(() => {
    const texts = this.effectiveTexts();
    const length = this._length();
    if (length === 0) {
      return {key: texts.rangeEmpty};
    }

    const start = this.currentPage() * this._pageSize() + 1;
    const end = Math.min((this.currentPage() + 1) * this._pageSize(), length);

    return {key: texts.range, params: {start, end, length}};
  });

  firstPage(): void {
    if (this.hasPrevious()) {
      this._pageIndex.set(0);
      this._emitPageEvent();
    }
  }

  lastPage(): void {
    if (this.hasNext()) {
      this._pageIndex.set(this.totalPages() - 1);
      this._emitPageEvent();
    }
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this._pageIndex.set(this.currentPage() - 1);
      this._emitPageEvent();
    }
  }

  nextPage(): void {
    if (this.hasNext()) {
      this._pageIndex.set(this.currentPage() + 1);
      this._emitPageEvent();
    }
  }

  goToPage(index: number): void {
    this._pageIndex.set(index);
    this._emitPageEvent();
  }

  onPageSizeChange(event: Event): void {
    const newSize = Number((event.target as HTMLSelectElement).value);
    this._pageSize.set(newSize);
    this._pageIndex.set(0);
    this._emitPageEvent();
  }

  private _emitPageEvent(): void {
    this.page.emit({
      pageIndex: this.currentPage(),
      pageSize: this._pageSize(),
      length: this._length(),
    });
  }
}
