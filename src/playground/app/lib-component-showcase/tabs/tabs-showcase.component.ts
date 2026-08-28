import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {TABS_TAB_CONTENT} from './tabs-tab-content';

const TABS: readonly Tab[] = [
  {id: 'overview', label: 'tabs-showcase.tabs.overview'},
  {id: 'sandbox', label: 'tabs-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-tabs-showcase',
  templateUrl: './tabs-showcase.component.html',
  styleUrl: './tabs-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class TabsShowcaseComponent {
  protected readonly routeBase = 'ndwu-tabs';
  protected readonly tabs = TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = TABS_TAB_CONTENT;
}
