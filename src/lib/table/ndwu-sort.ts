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
} from '@angular/core';
import {ICON_NAME, IconName, NdwuIconComponent} from '@ndw-ui-kit/core';

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
      <ndwu-icon
        class="ndwu-sort-header-indicator"
        [class.ndwu-sort-active]="isActive()"
        [name]="indicatorIcon()"
        aria-hidden="true"
      />
    </div>
  `,
  styleUrl: './ndwu-sort.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent],
  host: {
    'tabindex': '0',
    'role': 'columnheader',
    '(click)': '_handleClick()',
    '(keydown.enter)': '_handleClick()',
    '(keydown.space)': '_handleKeydownSpace($event)',
    '[attr.aria-sort]': 'ariaSort()',
  },
})
export class NdwuSortHeader implements OnInit {
  private readonly _sort = inject(NdwuSort);

  @Input('ndwu-sort-header') id = '';

  readonly isActive = computed(() => this._sort.activeSignal() === this.id && this._sort.directionSignal() !== '');
  readonly isAsc = computed(() => this.isActive() && this._sort.directionSignal() === 'asc');
  readonly isDesc = computed(() => this.isActive() && this._sort.directionSignal() === 'desc');

  /** Dimmed to 0.4 while inactive, so the neutral state reuses the ascending icon. */
  readonly indicatorIcon = computed<IconName>(() =>
    this.isDesc() ? ICON_NAME.SORTING_REVERSE_S : ICON_NAME.SORTING_DEFAULT_S,
  );

  readonly ariaSort = computed(() => {
    if (!this.isActive()) return null;
    return this._sort.directionSignal() === 'asc' ? 'ascending' : 'descending';
  });

  ngOnInit(): void {
    if (!this.id) {
      throw new Error('ndwu-sort-header must have an id');
    }
  }

  _handleClick(): void {
    this._sort.sort(this.id);
  }

  _handleKeydownSpace(event: Event): void {
    event.preventDefault();
    this._sort.sort(this.id);
  }
}
