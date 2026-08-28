import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {MULTI_SELECT_FIELD_TAB_CONTENT} from './multi-select-field-tab-content';

const MULTI_SELECT_FIELD_TABS: readonly Tab[] = [
  {id: 'overview', label: 'multi-select-field-showcase.tabs.overview'},
  {id: 'sandbox', label: 'multi-select-field-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-multi-select-field-showcase',
  templateUrl: './multi-select-field-showcase.component.html',
  styleUrl: './multi-select-field-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class MultiSelectFieldShowcaseComponent {
  protected readonly routeBase = 'ndwu-multi-select-field';
  protected readonly tabs = MULTI_SELECT_FIELD_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = MULTI_SELECT_FIELD_TAB_CONTENT;
}
