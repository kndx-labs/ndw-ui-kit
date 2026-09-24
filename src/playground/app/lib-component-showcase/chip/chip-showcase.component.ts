import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {CHIP_TAB_CONTENT} from './chip-tab-content';

const CHIP_TABS: readonly Tab[] = [
  {id: 'overview', label: 'chip-showcase.tabs.overview'},
  {id: 'sandbox', label: 'chip-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-chip-showcase',
  templateUrl: './chip-showcase.component.html',
  styleUrl: './chip-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class ChipShowcaseComponent {
  protected readonly routeBase = 'ndwu-chip';
  protected readonly tabs = CHIP_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = CHIP_TAB_CONTENT;
}
