import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {CHECKBOX_TAB_CONTENT} from './checkbox-tab-content';

const CHECKBOX_TABS: readonly Tab[] = [
  {id: 'overview', label: 'checkbox-showcase.tabs.overview'},
  {id: 'sandbox', label: 'checkbox-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-checkbox-showcase',
  templateUrl: './checkbox-showcase.component.html',
  styleUrl: './checkbox-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class CheckboxShowcaseComponent {
  protected readonly routeBase = 'ndwu-checkbox';
  protected readonly tabs = CHECKBOX_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = CHECKBOX_TAB_CONTENT;
}
