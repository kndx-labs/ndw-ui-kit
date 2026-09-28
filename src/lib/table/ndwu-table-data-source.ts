import {Injector, type Signal, type WritableSignal, computed, inject, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {DataSource} from '@angular/cdk/collections';
import type {Observable} from 'rxjs';
import type {NdwuSortState} from './ndwu-sort.directive';

export interface NdwuTableDataSourceOptions<T> {
  sortAccessor?: (row: T, column: string) => unknown;
  filterPredicate?: (row: T, filter: string) => boolean;
  /** Needed only when the source is built outside an injection context. */
  injector?: Injector;
}

function defaultSortAccessor<T>(row: T, column: string): unknown {
  return (row as Record<string, unknown>)[column];
}

function defaultFilterPredicate<T>(row: T, filter: string): boolean {
  return Object.values(row as Record<string, unknown>)
    .some(value => {
      return String(value)
        .toLowerCase()
        .includes(filter);
    });
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

export class NdwuTableDataSource<T> extends DataSource<T> {
  public readonly data: WritableSignal<readonly T[]> = signal<readonly T[]>([]);
  public readonly filter = signal('');
  public readonly sort = signal<NdwuSortState>({active: '', direction: ''});
  public readonly pageSize = signal(0);
  public readonly pageIndex = signal(0);

  public readonly filtered: Signal<readonly T[]>;
  public readonly sorted: Signal<readonly T[]>;
  public readonly page: Signal<readonly T[]>;
  /** Row count after filtering. */
  public readonly length: Signal<number>;
  public readonly isSorted: Signal<boolean>;

  private readonly injector: Injector;

  constructor(private readonly options: NdwuTableDataSourceOptions<T> = {}) {
    super();

    this.injector = options.injector ?? inject(Injector);

    this.filtered = computed(() => {
      const filter = this.filter()
        .trim()
        .toLowerCase();
      const predicate = this.options.filterPredicate ?? defaultFilterPredicate;

      return filter === ''
        ? this.data()
        : this.data().filter(row => predicate(row, filter));
    });

    this.sorted = computed(() => {
      const {active, direction} = this.sort();
      const rows = this.filtered();

      if (active === '' || direction === '') {
        return rows;
      }

      const accessor = this.options.sortAccessor ?? defaultSortAccessor;
      const factor = direction === 'asc' ? 1 : -1;

      return [...rows].sort((a, b) => factor * compare(accessor(a, active), accessor(b, active)));
    });

    this.length = computed(() => this.filtered().length);
    this.isSorted = computed(() => this.sort().active !== '' && this.sort().direction !== '');

    this.page = computed(() => {
      const size = this.pageSize();
      const rows = this.sorted();

      if (size <= 0) {
        return rows;
      }

      // Deleting rows can leave the index past the last page.
      const lastPage = Math.max(0, Math.ceil(rows.length / size) - 1);
      const start = Math.min(this.pageIndex(), lastPage) * size;

      return rows.slice(start, start + size);
    });
  }

  public connect(): Observable<readonly T[]> {
    return toObservable(this.page, {injector: this.injector});
  }

  public disconnect(): void {}

  /** Indices are page-relative, as the drop event reports them. */
  public moveRow(previousIndex: number, currentIndex: number): void {
    const page = this.page();
    const moved = page[previousIndex];
    const target = page[currentIndex];

    if (moved === undefined || target === undefined || moved === target) {
      return;
    }

    this.data.update(rows => {
      const next = [...rows];
      const from = next.indexOf(moved);
      const to = next.indexOf(target);

      if (from === -1 || to === -1) {
        return rows;
      }

      next.splice(to, 0, ...next.splice(from, 1));

      return next;
    });
  }
}
