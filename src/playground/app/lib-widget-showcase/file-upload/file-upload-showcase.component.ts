import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {FILE_UPLOAD_TAB_CONTENT} from './file-upload-tab-content';

const FILE_UPLOAD_TABS: readonly Tab[] = [
  {id: 'overview', label: 'file-upload-showcase.tabs.overview'},
];

@Component({
  selector: 'app-file-upload-showcase',
  templateUrl: './file-upload-showcase.component.html',
  styleUrl: './file-upload-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class FileUploadShowcaseComponent {
  protected readonly routeBase = 'ndwu-file-upload';
  protected readonly tabs = FILE_UPLOAD_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = FILE_UPLOAD_TAB_CONTENT;
}
