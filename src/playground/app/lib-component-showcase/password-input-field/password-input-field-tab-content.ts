import type {Type} from '@angular/core';
import {PasswordInputFieldOverviewComponent} from './overview/password-input-field-overview.component';
import {PasswordInputFieldSandboxComponent} from './sandbox/password-input-field-sandbox.component';

export const PASSWORD_INPUT_FIELD_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: PasswordInputFieldOverviewComponent,
  sandbox: PasswordInputFieldSandboxComponent,
};
