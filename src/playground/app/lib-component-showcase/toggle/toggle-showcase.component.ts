import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {TOGGLE_TAB_CONTENT} from './toggle-tab-content';

const TOGGLE_TABS: readonly Tab[] = [
  {id: 'overview', label: 'toggle-showcase.tabs.overview'},
  {id: 'sandbox', label: 'toggle-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-toggle-showcase',
  templateUrl: './toggle-showcase.component.html',
  styleUrl: './toggle-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class ToggleShowcaseComponent {
  protected readonly routeBase = 'ndwu-toggle';
  protected readonly tabs = TOGGLE_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = TOGGLE_TAB_CONTENT;
}
