import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {
  NDWU_SIZE,
  type NdwuSize,
  type NdwuTabItem,
  type NdwuTabVariant,
  type NdwuTabWidthMode,
  NdwuTabsComponent,
  type NdwuTabsScrollMode,
} from '@ndw-ui-kit/core';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-tabs-overview',
  templateUrl: './tabs-overview.component.html',
  styleUrl: './tabs-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuTabsComponent,
    ShowcaseLayoutComponent,
    NdwuLocalizePipe,
  ],
})
export class TabsOverviewComponent {
  protected readonly SIZE = NDWU_SIZE;

  protected readonly sizes: NdwuSize[] = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
  protected readonly variants: NdwuTabVariant[] = ['default', 'bordered'];

  protected readonly exampleTabs: NdwuTabItem[] = [
    {id: 'tab1', label: 'Tab 1'},
    {id: 'tab2', label: 'Tab 2'},
    {id: 'tab3', label: 'Tab 3', disabled: true},
    {id: 'tab4', label: 'Tab 4'},
  ];

  protected readonly iconTabs: NdwuTabItem[] = [
    {id: 'tab1', label: 'Tab 1', icon: 'bell_on_L'},
    {id: 'tab2', label: 'Tab 2', icon: 'folder_L'},
    {id: 'tab3', label: 'Tab 3', icon: 'settings_L', disabled: true},
    {id: 'tab4', label: 'Tab 4', icon: 'chart_L'},
  ];

  protected readonly badgeTabs: NdwuTabItem[] = [
    {id: 'tab1', label: 'Tab 1', badge: '2', badgeTone: 'negative'},
    {id: 'tab2', label: 'Tab 2', badge: '1'},
    {id: 'tab3', label: 'Tab 3', disabled: true, badge: '99+'},
    {id: 'tab4', label: 'Tab 4', badge: '99+', badgeTone: 'warning'},
  ];

  protected readonly scrollableExampleTabs: NdwuTabItem[] = [
    {id: 'tab1', label: 'Wi-Fi settings'},
    {id: 'tab2', label: 'Lan configuration'},
    {id: 'tab3', label: 'Port forwarding', disabled: true},
    {id: 'tab4', label: 'Diagnostics'},
    {id: 'tab5', label: 'Security'},
    {id: 'tab6', label: 'Advanced settings'},
  ];

  protected readonly scrollableShortExampleTabs: NdwuTabItem[] = [
    {id: 'tab1', label: 'Wi-Fi settings'},
    {id: 'tab2', label: 'Lan configuration'},
    {id: 'tab3', label: 'Port forwarding', disabled: true},
    {id: 'tab4', label: 'Diagnostics'},
  ];

  protected readonly fixedWidthTabs: NdwuTabItem[] = [
    {id: 'tab1', label: 'Tab 1', widthMode: 'fixed'},
    {id: 'tab2', label: 'Tab 2', widthMode: 'fixed'},
    {id: 'tab3', label: 'Tab 3', widthMode: 'fixed', disabled: true},
    {id: 'tab4', label: 'Tab 4', widthMode: 'fixed'},
  ];

  protected readonly mixedWidthTabs: NdwuTabItem[] = [
    {id: 'tab1', label: 'Content width'},
    {id: 'tab2', label: 'Fixed', widthMode: 'fixed'},
    {id: 'tab3', label: 'Content width', disabled: true},
    {id: 'tab4', label: 'Fixed', widthMode: 'fixed'},
  ];

  protected readonly selectedTabId = signal('tab2');

  protected readonly scrollModes: NdwuTabsScrollMode[] = ['auto', 'scrollable'];
  protected readonly tabWidthModes: NdwuTabWidthMode[] = ['content', 'fixed'];

  protected onTabChange(tabId: string): void {
    this.selectedTabId.set(tabId);
  }
}
