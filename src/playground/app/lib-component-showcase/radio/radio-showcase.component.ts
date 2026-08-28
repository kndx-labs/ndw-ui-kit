import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {RADIO_TAB_CONTENT} from './radio-tab-content';

const RADIO_TABS: readonly Tab[] = [
  {id: 'overview', label: 'radio-showcase.tabs.overview'},
  {id: 'sandbox', label: 'radio-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-radio-showcase',
  templateUrl: './radio-showcase.component.html',
  styleUrl: './radio-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class RadioShowcaseComponent {
  protected readonly routeBase = 'ndwu-radio';
  protected readonly tabs = RADIO_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = RADIO_TAB_CONTENT;
}
