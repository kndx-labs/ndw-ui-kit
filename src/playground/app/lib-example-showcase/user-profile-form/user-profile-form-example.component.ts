import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseTabsShellComponent, type Tab} from '@app/components';
import {USER_PROFILE_FORM_TAB_CONTENT} from './user-profile-form-tab-content';

const USER_PROFILE_FORM_TABS: readonly Tab[] = [
  {id: 'overview', label: 'user-profile-form-example.tabs.overview'},
  {id: 'autofill', label: 'user-profile-form-example.tabs.autofill'},
];

@Component({
  selector: 'app-user-profile-form-example',
  templateUrl: './user-profile-form-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowcaseTabsShellComponent],
})
export class UserProfileFormExampleComponent {
  protected readonly routeBase = 'user-profile-form';
  protected readonly tabs = USER_PROFILE_FORM_TABS;
  protected readonly defaultTabId = 'overview';
  protected readonly tabContentMap = USER_PROFILE_FORM_TAB_CONTENT;
}
