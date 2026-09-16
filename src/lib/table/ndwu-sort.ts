import {
  Directive,
  EventEmitter,
  Input,
  Output,
  Signal,
  signal,
  computed,
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';

export type NdwuSortDirection = 'asc' | 'desc' | '';

export interface NdwuSortState {
  active: string;
  direction: NdwuSortDirection;
}

@Directive({
  selector: '[ndwuSort]',
  exportAs: 'ndwuSort',
})
export class NdwuSort {
  private readonly _active = signal('');
  private readonly _direction = signal<NdwuSortDirection>('');

  @Input('ndwuSortActive')
  set active(value: string) { this._active.set(value); }
  get active(): string { return this._active(); }

  @Input('ndwuSortDirection')
  set direction(value: NdwuSortDirection) { this._direction.set(value); }
  get direction(): NdwuSortDirection { return this._direction(); }

  @Output('ndwuSortChange') readonly sortChange = new EventEmitter<NdwuSortState>();

  readonly activeSignal: Signal<string> = this._active.asReadonly();
  readonly directionSignal: Signal<NdwuSortDirection> = this._direction.asReadonly();

  sort(id: string): void {
    if (this._active() === id) {
      const next = this._nextDirection(this._direction());
      this._direction.set(next);
      if (next === '') {
        this._active.set('');
      }
    } else {
      this._active.set(id);
      this._direction.set('asc');
    }
    this.sortChange.emit({active: this._active(), direction: this._direction()});
  }

  private _nextDirection(current: NdwuSortDirection): NdwuSortDirection {
    if (current === 'asc') return 'desc';
    if (current === 'desc') return '';
    return 'asc';
  }
}

@Component({
  selector: '[ndwu-sort-header]',
  exportAs: 'ndwuSortHeader',
  template: `
    <div class="ndwu-sort-header-inner">
      <span class="ndwu-sort-header-content"><ng-content /></span>
      <span class="ndwu-sort-header-indicator" [class.ndwu-sort-active]="isActive()">
        <span class="ndwu-sort-arrow" [class.ndwu-sort-asc]="isAsc()" [class.ndwu-sort-desc]="isDesc()">
          @if (isActive()) {
            @if (isAsc()) { &#x25B2; }
            @if (isDesc()) { &#x25BC; }
          } @else {
            &#x25B4;&#x25BE;
          }
        </span>
      </span>
    </div>
  `,
  styles: `
    [ndwu-sort-header] {
      cursor: pointer;
      user-select: none;
    }

    .ndwu-sort-header-inner {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .ndwu-sort-header-indicator {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      font-size: 10px;
      line-height: 1;
      color: var(--ndwu-table-header-color);
      opacity: 0.4;
    }

    .ndwu-sort-header-indicator.ndwu-sort-active {
      opacity: 1;
      color: var(--ndwu-table-cell-color);
    }

    .ndwu-sort-arrow {
      display: inline-flex;
      flex-direction: column;
      line-height: 0.8;
      letter-spacing: -2px;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': '_handleClick()',
    '[attr.aria-sort]': 'ariaSort()',
  },
})
export class NdwuSortHeader implements OnInit, OnDestroy {
  private readonly _sort = inject(NdwuSort);

  @Input('ndwu-sort-header') id = '';

  readonly isActive = computed(() => this._sort.activeSignal() === this.id && this._sort.directionSignal() !== '');
  readonly isAsc = computed(() => this.isActive() && this._sort.directionSignal() === 'asc');
  readonly isDesc = computed(() => this.isActive() && this._sort.directionSignal() === 'desc');

  readonly ariaSort = computed(() => {
    if (!this.isActive()) return null;
    return this._sort.directionSignal() === 'asc' ? 'ascending' : 'descending';
  });

  ngOnInit(): void {
    if (!this.id) {
      throw new Error('ndwu-sort-header must have an id');
    }
  }

  ngOnDestroy(): void {}

  _handleClick(): void {
    this._sort.sort(this.id);
  }
}
