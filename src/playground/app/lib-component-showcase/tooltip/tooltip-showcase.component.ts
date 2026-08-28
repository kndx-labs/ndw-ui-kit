import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {TOOLTIP_TAB_CONTENT} from './tooltip-tab-content';

const TOOLTIP_TABS: readonly Tab[] = [
  {id: 'overview', label: 'tooltip-showcase.tabs.overview'},
  {id: 'sandbox', label: 'tooltip-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-tooltip-showcase',
  templateUrl: './tooltip-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ShowcaseTabsShellComponent,
  ],
})
export class TooltipShowcaseComponent {
  protected readonly routeBase = 'ndwu-tooltip';
  protected readonly tabs = TOOLTIP_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = TOOLTIP_TAB_CONTENT;
}
