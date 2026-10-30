import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {AUTOCOMPLETE_TAB_CONTENT} from './autocomplete-tab-content';

const AUTOCOMPLETE_TABS: readonly Tab[] = [
  {id: 'overview', label: 'autocomplete-showcase.tabs.overview'},
  {id: 'sandbox', label: 'autocomplete-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-autocomplete-showcase',
  templateUrl: './autocomplete-showcase.component.html',
  styleUrl: './autocomplete-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class AutocompleteShowcaseComponent {
  protected readonly routeBase = 'ndwu-autocomplete';
  protected readonly tabs = AUTOCOMPLETE_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = AUTOCOMPLETE_TAB_CONTENT;
}
