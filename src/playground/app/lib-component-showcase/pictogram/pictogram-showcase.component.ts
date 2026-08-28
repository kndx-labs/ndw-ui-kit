import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent} from '@app/components';
import {PICTOGRAM_TABS, PICTOGRAM_TAB_CONTENT} from './pictogram-tab-content';

@Component({
  selector: 'app-pictogram-showcase',
  templateUrl: './pictogram-showcase.component.html',
  styleUrl: './pictogram-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class PictogramShowcaseComponent {
  protected readonly routeBase = 'ndwu-pictogram';
  protected readonly tabs = PICTOGRAM_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = PICTOGRAM_TAB_CONTENT;
}
