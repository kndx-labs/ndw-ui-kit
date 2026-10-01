import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {TEXTAREA_FIELD_TAB_CONTENT} from './textarea-field-tab-content';

const TEXTAREA_FIELD_TABS: readonly Tab[] = [
  {id: 'overview', label: 'textarea-field-showcase.tabs.overview'},
  {id: 'sandbox', label: 'textarea-field-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-textarea-field-showcase',
  templateUrl: './textarea-field-showcase.component.html',
  styleUrl: './textarea-field-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class TextareaFieldShowcaseComponent {
  protected readonly routeBase = 'ndwu-textarea-field';
  protected readonly tabs = TEXTAREA_FIELD_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = TEXTAREA_FIELD_TAB_CONTENT;
}
