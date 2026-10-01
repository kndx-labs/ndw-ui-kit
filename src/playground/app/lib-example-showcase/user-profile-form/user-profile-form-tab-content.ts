import type {Type} from '@angular/core';
import {UserProfileFormOverviewComponent} from './overview/user-profile-form-overview.component';
import {UserProfileFormAutofillComponent} from './autofill/user-profile-form-autofill.component';

export const USER_PROFILE_FORM_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: UserProfileFormOverviewComponent,
  autofill: UserProfileFormAutofillComponent,
};
