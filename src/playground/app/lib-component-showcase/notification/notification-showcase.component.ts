import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {NOTIFICATION_TAB_CONTENT} from './notification-tab-content';

const NOTIFICATION_TABS: readonly Tab[] = [
  {id: 'overview', label: 'notification-showcase.tabs.overview'},
  {id: 'sandbox', label: 'notification-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-notification-showcase',
  templateUrl: './notification-showcase.component.html',
  styleUrl: './notification-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class NotificationShowcaseComponent {
  protected readonly routeBase = 'ndwu-notification';
  protected readonly tabs = NOTIFICATION_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = NOTIFICATION_TAB_CONTENT;
}
