import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {ROUTER_LOADER_TAB_CONTENT} from './router-loader-tab-content';

const ROUTER_LOADER_TABS: readonly Tab[] = [
  {id: 'overview', label: 'router-loader-showcase.tabs.overview'},
];

@Component({
  selector: 'app-router-loader-showcase',
  templateUrl: './router-loader-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class RouterLoaderShowcaseComponent {
  protected readonly routeBase = 'ndwu-router-loader';
  protected readonly tabs = ROUTER_LOADER_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = ROUTER_LOADER_TAB_CONTENT;
}
