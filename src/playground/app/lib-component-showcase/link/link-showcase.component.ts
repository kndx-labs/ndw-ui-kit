import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {LINK_TAB_CONTENT} from './link-tab-content';

const LINK_TABS: readonly Tab[] = [
  {id: 'overview', label: 'link-showcase.tabs.overview'},
  {id: 'sandbox', label: 'link-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-link-showcase',
  templateUrl: './link-showcase.component.html',
  styleUrl: './link-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class LinkShowcaseComponent {
  protected readonly routeBase = 'ndwu-link';
  protected readonly tabs = LINK_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = LINK_TAB_CONTENT;
}
