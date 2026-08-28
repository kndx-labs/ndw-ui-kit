import type {Type} from '@angular/core';
import {UserProfileFormOverviewComponent} from './overview/user-profile-form-overview.component';

export const USER_PROFILE_FORM_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: UserProfileFormOverviewComponent,
};
