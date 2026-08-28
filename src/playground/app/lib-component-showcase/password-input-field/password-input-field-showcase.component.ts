import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {PASSWORD_INPUT_FIELD_TAB_CONTENT} from './password-input-field-tab-content';

const PASSWORD_INPUT_FIELD_TABS: readonly Tab[] = [
  {id: 'overview', label: 'password-input-field-showcase.tabs.overview'},
  {id: 'sandbox', label: 'password-input-field-showcase.tabs.sandbox'},
];

@Component({
  selector: 'app-password-input-field-showcase',
  templateUrl: './password-input-field-showcase.component.html',
  styleUrl: './password-input-field-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class PasswordInputFieldShowcaseComponent {
  protected readonly routeBase = 'ndwu-password-input-field';
  protected readonly tabs = PASSWORD_INPUT_FIELD_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = PASSWORD_INPUT_FIELD_TAB_CONTENT;
}
