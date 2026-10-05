import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {TAG_TAB_CONTENT} from './tag-tab-content';

const TAG_TABS: readonly Tab[] = [
  {id: 'overview', label: 'tag-showcase.tabs.overview'},
  {id: 'sandbox', label: 'tag-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-tag-showcase',
  templateUrl: './tag-showcase.component.html',
  styleUrl: './tag-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class TagShowcaseComponent {
  protected readonly routeBase = 'ndwu-tag';
  protected readonly tabs = TAG_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = TAG_TAB_CONTENT;
}
