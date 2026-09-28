import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {VALIDATORS_TAB_CONTENT} from './validators-tab-content';

const VALIDATORS_TABS: readonly Tab[] = [
  {id: 'overview', label: 'validators-example.tabs.overview'},
];

@Component({
  selector: 'app-validators-example',
  templateUrl: './validators-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class ValidatorsExampleComponent {
  protected readonly routeBase = 'validators';
  protected readonly tabs = VALIDATORS_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = VALIDATORS_TAB_CONTENT;
}
