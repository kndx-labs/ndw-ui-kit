import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {ACCORDION_TAB_CONTENT} from './accordion-tab-content';

const ACCORDION_TABS: readonly Tab[] = [
  {id: 'overview', label: 'accordion-showcase.tabs.overview'},
];

@Component({
  selector: 'app-accordion-showcase',
  templateUrl: './accordion-showcase.component.html',
  styleUrl: './accordion-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class AccordionShowcaseComponent {
  protected readonly routeBase = 'ndwu-accordion';
  protected readonly tabs = ACCORDION_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = ACCORDION_TAB_CONTENT;
}
