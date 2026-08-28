import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {ICON_BUTTON_TAB_CONTENT} from './button-tab-content';

const ICON_BUTTON_TABS: readonly Tab[] = [
  {id: 'overview', label: 'icon-button-showcase.tabs.overview'},
  {id: 'sandbox', label: 'icon-button-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-icon-button-showcase',
  templateUrl: './icon-button-showcase.component.html',
  styleUrl: './icon-button-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class IconButtonShowcaseComponent {
  protected readonly routeBase = 'ndwu-icon-button';
  protected readonly tabs = ICON_BUTTON_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = ICON_BUTTON_TAB_CONTENT;
}
