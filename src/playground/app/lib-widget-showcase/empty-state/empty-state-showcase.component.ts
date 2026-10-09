import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent} from '@app/components';
import {EMPTY_STATE_TABS, EMPTY_STATE_TAB_CONTENT} from './empty-state-tab-content';

@Component({
  selector: 'app-empty-state-showcase',
  templateUrl: './empty-state-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class EmptyStateShowcaseComponent {
  protected readonly routeBase = 'ndwu-empty-state';
  protected readonly tabs = EMPTY_STATE_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = EMPTY_STATE_TAB_CONTENT;
}
