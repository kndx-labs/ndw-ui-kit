import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {TEXTAREA_TAB_CONTENT} from './textarea-tab-content';

const TEXTAREA_TABS: readonly Tab[] = [
  {id: 'overview', label: 'textarea-showcase.tabs.overview'},
  {id: 'sandbox', label: 'textarea-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-textarea-showcase',
  templateUrl: './textarea-showcase.component.html',
  styleUrl: './textarea-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class TextareaShowcaseComponent {
  protected readonly routeBase = 'ndwu-textarea';
  protected readonly tabs = TEXTAREA_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = TEXTAREA_TAB_CONTENT;
}
