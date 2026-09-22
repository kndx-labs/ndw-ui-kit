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
    // The sort target is the inner button, so the cell keeps its native
    // `columnheader` role and stays out of the tab order; `aria-sort`
    // belongs on the header cell itself.
    'class': 'ndwu-sort-header',
    '[attr.aria-sort]': 'ariaSort()',
  },
})
export class NdwuSortHeaderComponent {
  private readonly sortState = inject(NdwuSortDirective);

  public readonly id = input.required<string>({alias: 'ndwuSortHeader'});

  // Only the id is public: the sort state itself is read from `NdwuSortDirective`,
  // which is what a host binds and listens to.
  protected readonly isActive = computed(() => {
    return this.sortState.active() === this.id() && this.sortState.direction() !== '';
  });

  protected readonly isDesc = computed(() => this.isActive() && this.sortState.direction() === 'desc');

  /** Dimmed to 0.4 while inactive, so the neutral state reuses the ascending icon. */
  protected readonly indicatorIcon = computed<IconName>(() => {
    return this.isDesc() ? ICON_NAME.SORTING_REVERSE_S : ICON_NAME.SORTING_DEFAULT_S;
  });

  protected readonly ariaSort = computed(() => {
    if (!this.isActive()) {
      return null;
    }

    return this.sortState.direction() === 'asc' ? 'ascending' : 'descending';
  });

  protected onSort(): void {
    this.sortState.sort(this.id());
  }
}
