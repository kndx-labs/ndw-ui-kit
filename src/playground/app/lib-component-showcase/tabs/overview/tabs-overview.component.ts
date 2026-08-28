import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {
  type NdwuTabVariant,
  type NdwuTabWidthMode,
  NdwuTabsComponent,
  type NdwuTabsScrollMode,
  SIZE,
  type Size,
  type TabItem,
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
    LocalizePipe,
  ],
})
export class TabsOverviewComponent {
  protected readonly SIZE = SIZE;

  protected readonly sizes: Size[] = [SIZE.L, SIZE.XL, SIZE.XXL];
  protected readonly variants: NdwuTabVariant[] = ['default', 'bordered'];

  protected readonly exampleTabs: TabItem[] = [
    {id: 'tab1', label: 'Tab 1'},
    {id: 'tab2', label: 'Tab 2'},
    {id: 'tab3', label: 'Tab 3', disabled: true},
    {id: 'tab4', label: 'Tab 4'},
  ];

  protected readonly iconTabs: TabItem[] = [
    {id: 'tab1', label: 'Tab 1', icon: 'bell_on_L'},
    {id: 'tab2', label: 'Tab 2', icon: 'folder_L'},
    {id: 'tab3', label: 'Tab 3', icon: 'settings_L', disabled: true},
    {id: 'tab4', label: 'Tab 4', icon: 'chart_L'},
  ];

  protected readonly badgeTabs: TabItem[] = [
    {id: 'tab1', label: 'Tab 1', badge: '2', badgeTone: 'negative'},
    {id: 'tab2', label: 'Tab 2', badge: '1'},
    {id: 'tab3', label: 'Tab 3', disabled: true, badge: '99+'},
    {id: 'tab4', label: 'Tab 4', badge: '99+', badgeTone: 'warning'},
  ];

  protected readonly scrollableExampleTabs: TabItem[] = [
    {id: 'tab1', label: 'Wi-Fi settings'},
    {id: 'tab2', label: 'Lan configuration'},
    {id: 'tab3', label: 'Port forwarding', disabled: true},
    {id: 'tab4', label: 'Diagnostics'},
    {id: 'tab5', label: 'Security'},
    {id: 'tab6', label: 'Advanced settings'},
  ];

  protected readonly scrollableShortExampleTabs: TabItem[] = [
    {id: 'tab1', label: 'Wi-Fi settings'},
    {id: 'tab2', label: 'Lan configuration'},
    {id: 'tab3', label: 'Port forwarding', disabled: true},
    {id: 'tab4', label: 'Diagnostics'},
  ];

  protected readonly fixedWidthTabs: TabItem[] = [
    {id: 'tab1', label: 'Tab 1', widthMode: 'fixed'},
    {id: 'tab2', label: 'Tab 2', widthMode: 'fixed'},
    {id: 'tab3', label: 'Tab 3', widthMode: 'fixed', disabled: true},
    {id: 'tab4', label: 'Tab 4', widthMode: 'fixed'},
  ];

  protected readonly mixedWidthTabs: TabItem[] = [
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
