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
    // The inner button sorts; the cell keeps `columnheader` and `aria-sort`.
    'class': 'ndwu-sort-header',
    '[attr.aria-sort]': 'ariaSort()',
  },
})
export class NdwuSortHeaderComponent {
  private readonly sortState = inject(NdwuSortDirective);

  public readonly id = input.required<string>({alias: 'ndwuSortHeader'});

  protected readonly isActive = computed(() => {
    return this.sortState.active() === this.id() && this.sortState.direction() !== '';
  });

  protected readonly isDesc = computed(() => this.isActive() && this.sortState.direction() === 'desc');

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
