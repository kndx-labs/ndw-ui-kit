import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {BADGE_TAB_CONTENT} from './badge-tab-content';

const BADGE_TABS: readonly Tab[] = [
  {id: 'overview', label: 'badge-showcase.tabs.overview'},
  {id: 'sandbox', label: 'badge-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-badge-showcase',
  templateUrl: './badge-showcase.component.html',
  styleUrl: './badge-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class BadgeShowcaseComponent {
  protected readonly routeBase = 'ndwu-badge';
  protected readonly tabs = BADGE_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = BADGE_TAB_CONTENT;
}
