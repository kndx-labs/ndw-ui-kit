import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {TABLE_TAB_CONTENT} from './table-tab-content';

const TABLE_TABS: readonly Tab[] = [
  {id: 'overview', label: 'table-showcase.tabs.overview'},
];

@Component({
  selector: 'app-table-showcase',
  template: `
    <div class="component-showcase">
      <app-showcase-tabs-shell
        [routeBase]="routeBase"
        [tabs]="tabs"
        [defaultTabId]="defaultTabId"
        [tabContentMap]="tabContentMap"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class TableShowcaseComponent {
  protected readonly routeBase = 'ndwu-table';
  protected readonly tabs = TABLE_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = TABLE_TAB_CONTENT;
}
