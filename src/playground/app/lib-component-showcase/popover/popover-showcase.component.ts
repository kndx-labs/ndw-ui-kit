import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {POPOVER_TAB_CONTENT} from './popover-tab-content';

const POPOVER_TABS: readonly Tab[] = [
  {id: 'overview', label: 'popover-showcase.tabs.overview'},
  {id: 'sandbox', label: 'popover-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-popover-showcase',
  templateUrl: './popover-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ShowcaseTabsShellComponent],
})
export class PopoverShowcaseComponent {
  protected readonly routeBase = 'ndwu-popover';
  protected readonly tabs = POPOVER_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = POPOVER_TAB_CONTENT;
}
