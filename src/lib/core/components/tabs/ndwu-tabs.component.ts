import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {type NdwuTabItem, type NdwuTabVariant, type NdwuTabWidthMode, type NdwuTabsScrollMode} from './ndwu-tabs.types';
import {NdwuTabItemComponent} from './ndwu-tab-item.component';
import {type NdwuSize, SIZE} from '../../../shared.types';

@Component({
  selector: 'ndwu-tabs',
  templateUrl: './ndwu-tabs.component.html',
  styleUrl: './ndwu-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuTabItemComponent],
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': '"tablist"',
    '[style]': 'scrollStyle()',
  },
})
export class NdwuTabsComponent {
  public readonly tabs = input.required<NdwuTabItem[]>();
  public readonly selectedTabId = input<string | null>(null);
  public readonly size = input<NdwuSize>(SIZE.L);
  public readonly variant = input<NdwuTabVariant>('default');
  public readonly scrollMode = input<NdwuTabsScrollMode>('auto');
  public readonly scrollContainerWidth = input<string>('auto');
  public readonly tabWidthMode = input<NdwuTabWidthMode>('content');

  public readonly tabChange = output<string>();

  protected readonly hostClass = computed(() => {
    return [
      'ndwu-tabs',
      `ndwu-tabs--size-${this.size()}`,
      `ndwu-tabs--variant-${this.variant()}`,
      `ndwu-tabs--scroll-${this.scrollMode()}`,
    ].join(' ');
  });

  protected readonly scrollStyle = computed(() => {
    return {'--ndwu-tabs-scroll-width': this.scrollContainerWidth()};
  });

  protected onTabSelect(tab: NdwuTabItem): void {
    if (tab.disabled) {
      return;
    }

    this.tabChange.emit(tab.id);
  }

  protected isTabSelected(tab: NdwuTabItem): boolean {
    return this.selectedTabId() === tab.id;
  }
}
