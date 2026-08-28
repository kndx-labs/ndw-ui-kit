import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {CARD_TAB_CONTENT} from './card-tab-content';

const CARD_TABS: readonly Tab[] = [
  {id: 'overview', label: 'card-showcase.tabs.overview'},
  {id: 'sandbox', label: 'card-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-card-showcase',
  templateUrl: './card-showcase.component.html',
  styleUrl: './card-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class CardShowcaseComponent {
  protected readonly routeBase = 'ndwu-card';
  protected readonly tabs = CARD_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = CARD_TAB_CONTENT;
}
