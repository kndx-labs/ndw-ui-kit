import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {SELECT_FIELD_TAB_CONTENT} from './select-field-tab-content';

const SELECT_FIELD_TABS: readonly Tab[] = [
  {id: 'overview', label: 'select-field-showcase.tabs.overview'},
  {id: 'sandbox', label: 'select-field-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-select-field-showcase',
  templateUrl: './select-field-showcase.component.html',
  styleUrl: './select-field-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class SelectFieldShowcaseComponent {
  protected readonly routeBase = 'ndwu-select-field';
  protected readonly tabs = SELECT_FIELD_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = SELECT_FIELD_TAB_CONTENT;
}
