import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {HEAT_STRIP_TAB_CONTENT} from './heat-strip-tab-content';

const HEAT_STRIP_TABS: readonly Tab[] = [
  {id: 'overview', label: 'heat-strip-showcase.tabs.overview'},
];

@Component({
  selector: 'app-heat-strip-showcase',
  templateUrl: './heat-strip-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class HeatStripShowcaseComponent {
  protected readonly routeBase = 'ndwu-heat-strip';
  protected readonly tabs = HEAT_STRIP_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = HEAT_STRIP_TAB_CONTENT;
}
