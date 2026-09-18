import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';

export interface NdwuPageEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

@Component({
  selector: 'ndwu-paginator',
  exportAs: 'ndwuPaginator',
  template: `
    <div class="ndwu-paginator-range">
      {{ rangeLabel() }}
    </div>
    <div class="ndwu-paginator-controls">
      <button
        class="ndwu-paginator-btn"
        [disabled]="!hasPrevious()"
        (click)="previousPage()"
        aria-label="Previous page"
      >&#x2039;</button>
      @for (page of visiblePages(); track page) {
        <button
          class="ndwu-paginator-btn ndwu-paginator-page"
          [class.ndwu-paginator-active]="page === currentPage()"
          [attr.aria-current]="page === currentPage() ? 'page' : null"
          (click)="goToPage(page)"
        >{{ page + 1 }}</button>
      }
      <button
        class="ndwu-paginator-btn"
        [disabled]="!hasNext()"
        (click)="nextPage()"
        aria-label="Next page"
      >&#x203A;</button>
    </div>
    @if (pageSizeOptions.length > 1) {
      <div class="ndwu-paginator-size">
        <select
          class="ndwu-paginator-select"
          [value]="_pageSize()"
          (change)="onPageSizeChange($event)"
        >
          @for (size of pageSizeOptions; track size) {
            <option [value]="size">{{ size }} / page</option>
          }
        </select>
      </div>
    }
  `,
  styleUrl: './ndwu-paginator.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ndwu-paginator',
  },
})
export class NdwuPaginator {
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

  readonly rangeLabel = computed(() => {
    const len = this._length();
    if (len === 0) return '0 of 0';
    const start = this.currentPage() * this._pageSize() + 1;
    const end = Math.min((this.currentPage() + 1) * this._pageSize(), len);
    return `${start}–${end} of ${len}`;
  });

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 5) {
      return Array.from({length: total}, (_, i) => i);
    }
    const start = Math.max(0, Math.min(current - 2, total - 5));
    return Array.from({length: 5}, (_, i) => start + i);
  });

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
