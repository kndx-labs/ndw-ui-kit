import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent} from '@app/components';
import {SCROLLBAR_TABS, SCROLLBAR_TAB_CONTENT} from './scrollbar-tab-content';

@Component({
  selector: 'app-scrollbar-showcase',
  templateUrl: './scrollbar-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class ScrollbarShowcaseComponent {
  protected readonly routeBase = 'ndwu-scrollbar';
  protected readonly tabs = SCROLLBAR_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = SCROLLBAR_TAB_CONTENT;
}
