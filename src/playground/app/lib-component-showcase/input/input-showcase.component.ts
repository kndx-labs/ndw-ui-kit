import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {INPUT_TAB_CONTENT} from './input-tab-content';

const INPUT_TABS: readonly Tab[] = [
  {id: 'overview', label: 'input-showcase.tabs.overview'},
  {id: 'sandbox', label: 'input-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-input-showcase',
  templateUrl: './input-showcase.component.html',
  styleUrl: './input-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class InputShowcaseComponent {
  protected readonly routeBase = 'ndwu-input';
  protected readonly tabs = INPUT_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = INPUT_TAB_CONTENT;
}
