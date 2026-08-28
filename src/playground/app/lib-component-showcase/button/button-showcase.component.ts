import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {BUTTON_TAB_CONTENT} from './button-tab-content';

const BUTTON_TABS: readonly Tab[] = [
  {id: 'overview', label: 'button-showcase.tabs.overview'},
  {id: 'sandbox', label: 'button-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-button-showcase',
  templateUrl: './button-showcase.component.html',
  styleUrl: './button-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class ButtonShowcaseComponent {
  protected readonly routeBase = 'ndwu-button';
  protected readonly tabs = BUTTON_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = BUTTON_TAB_CONTENT;
}
