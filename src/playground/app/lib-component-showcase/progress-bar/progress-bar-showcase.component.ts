import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {PROGRESS_BAR_TAB_CONTENT} from './progress-bar-tab-content';

const PROGRESS_BAR_TABS: readonly Tab[] = [
  {id: 'overview', label: 'progress-bar-showcase.tabs.overview'},
  {id: 'sandbox', label: 'progress-bar-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-progress-bar-showcase',
  templateUrl: './progress-bar-showcase.component.html',
  styleUrl: './progress-bar-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class ProgressBarShowcaseComponent {
  protected readonly routeBase = 'ndwu-progress-bar';
  protected readonly tabs = PROGRESS_BAR_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = PROGRESS_BAR_TAB_CONTENT;
}
