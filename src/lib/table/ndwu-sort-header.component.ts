import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
} from '@angular/core';
import {ICON_NAME, IconName, NdwuIconComponent} from '@ndw-ui-kit/core';
import {NdwuSortDirective} from './ndwu-sort.directive';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[ndwuSortHeader]',
  exportAs: 'ndwuSortHeader',
  templateUrl: './ndwu-sort-header.component.html',
  styleUrl: './ndwu-sort-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent],
  host: {
    'class': 'ndwu-sort-header',
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
