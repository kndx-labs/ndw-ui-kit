import {
  Directive,
  computed,
  model,
  output,
  input,
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
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
export class NdwuSortDirective {
  // Sorting is toggled from the headers, so the state is a model: the host may
  // seed it and is notified through `ndwuSortChange`.
  public readonly active = model('', {alias: 'ndwuSortActive'});
  public readonly direction = model<NdwuSortDirection>('', {alias: 'ndwuSortDirection'});

  public readonly ndwuSortChange = output<NdwuSortState>();

  public sort(id: string): void {
    if (this.active() === id) {
      const next = this.nextDirection(this.direction());

      this.direction.set(next);

      if (next === '') {
        this.active.set('');
      }
    } else {
      this.active.set(id);
      this.direction.set('asc');
    }

    this.ndwuSortChange.emit({active: this.active(), direction: this.direction()});
  }

  private nextDirection(current: NdwuSortDirection): NdwuSortDirection {
    if (current === 'asc') {
      return 'desc';
    }

    if (current === 'desc') {
      return '';
    }

    return 'asc';
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[ndwuSortHeader]',
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
    '(click)': 'onSort()',
    '(keydown.enter)': 'onSort()',
    '(keydown.space)': 'onSortKeydown($event)',
    '[attr.aria-sort]': 'ariaSort()',
  },
})
export class NdwuSortHeaderComponent {
  private readonly sortState = inject(NdwuSortDirective);

  public readonly id = input.required<string>({alias: 'ndwuSortHeader'});

  public readonly isActive = computed(() =>
    this.sortState.active() === this.id() && this.sortState.direction() !== '',
  );

  public readonly isAsc = computed(() => this.isActive() && this.sortState.direction() === 'asc');
  public readonly isDesc = computed(() => this.isActive() && this.sortState.direction() === 'desc');

  /** Dimmed to 0.4 while inactive, so the neutral state reuses the ascending icon. */
  protected readonly indicatorIcon = computed<IconName>(() =>
    this.isDesc() ? ICON_NAME.SORTING_REVERSE_S : ICON_NAME.SORTING_DEFAULT_S,
  );

  protected readonly ariaSort = computed(() => {
    if (!this.isActive()) {
      return null;
    }

    return this.sortState.direction() === 'asc' ? 'ascending' : 'descending';
  });

  protected onSort(): void {
    this.sortState.sort(this.id());
  }

  protected onSortKeydown(event: Event): void {
    event.preventDefault();
    this.sortState.sort(this.id());
  }
}
