import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {SPOKES_LOADER_TAB_CONTENT} from './spokes-loader-tab-content';

const SPOKES_LOADER_TABS: readonly Tab[] = [
  {id: 'sandbox', label: 'spokes-loader-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-spokes-loader-showcase',
  templateUrl: './spokes-loader-showcase.component.html',
  styleUrl: './spokes-loader-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class SpokesLoaderShowcaseComponent {
  protected readonly routeBase = 'ndwu-spokes-loader';
  protected readonly tabs = SPOKES_LOADER_TABS;
  protected readonly defaultTabId = 'sandbox';
  protected readonly tabContentMap = SPOKES_LOADER_TAB_CONTENT;
}
