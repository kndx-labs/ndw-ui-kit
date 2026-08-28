import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {TIMING_BUTTON_TAB_CONTENT} from './timing-button-tab-content';

const TIMING_BUTTON_TABS: readonly Tab[] = [
  {id: 'overview', label: 'timing-button-showcase.tabs.overview'},
  {id: 'sandbox', label: 'timing-button-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-timing-button-showcase',
  templateUrl: './timing-button-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class TimingButtonShowcaseComponent {
  protected readonly routeBase = 'ndwu-timing-button';
  protected readonly tabs = TIMING_BUTTON_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = TIMING_BUTTON_TAB_CONTENT;
}
