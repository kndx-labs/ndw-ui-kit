import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {NDWU_ICON_NAME, NdwuIconComponent, NdwuIconName} from '@ndw-ui-kit/core';
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
    // The inner button sorts; the cell keeps `columnheader` and `aria-sort`.
    'class': 'ndwu-sort-header',
    '[attr.aria-sort]': 'ariaSort()',
  },
})
export class NdwuSortHeaderComponent {
  private readonly sortState = inject(NdwuSortDirective);

  public readonly id = input.required<string>({alias: 'ndwuSortHeader'});

  protected readonly isActive = computed(() => {
    const {active, direction} = this.sortState.state();

    return active === this.id() && direction !== '';
  });

  protected readonly isDesc = computed(() => this.isActive() && this.sortState.state().direction === 'desc');

  protected readonly indicatorIcon = computed<NdwuIconName>(() => {
    return this.isDesc() ? NDWU_ICON_NAME.SORTING_REVERSE_S : NDWU_ICON_NAME.SORTING_DEFAULT_S;
  });

  protected readonly ariaSort = computed(() => {
    if (!this.isActive()) {
      return null;
    }

    return this.sortState.state().direction === 'asc' ? 'ascending' : 'descending';
  });

  protected onSort(): void {
    this.sortState.sort(this.id());
  }
}
