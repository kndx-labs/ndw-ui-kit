import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {SCHEDULE_EDITOR_TAB_CONTENT} from './schedule-editor-tab-content';

const SCHEDULE_EDITOR_TABS: readonly Tab[] = [
  {id: 'overview', label: 'schedule-editor-showcase.tabs.overview'},
  {id: 'cva', label: 'schedule-editor-showcase.tabs.cva'},
];

@Component({
  selector: 'app-schedule-editor-showcase',
  templateUrl: './schedule-editor-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class ScheduleEditorShowcaseComponent {
  protected readonly routeBase = 'ndwu-schedule-editor';
  protected readonly tabs = SCHEDULE_EDITOR_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = SCHEDULE_EDITOR_TAB_CONTENT;
}
