import type {Type} from '@angular/core';
import {SelectFieldOverviewComponent} from './overview/select-field-overview.component';
import {SelectFieldSandboxComponent} from './sandbox/select-field-sandbox.component';

export const SELECT_FIELD_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: SelectFieldOverviewComponent,
  sandbox: SelectFieldSandboxComponent,
};
