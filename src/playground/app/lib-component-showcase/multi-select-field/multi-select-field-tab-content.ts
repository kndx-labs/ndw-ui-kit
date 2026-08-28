import type {Type} from '@angular/core';
import {MultiSelectFieldOverviewComponent} from './overview/multi-select-field-overview.component';
import {MultiSelectFieldSandboxComponent} from './sandbox/multi-select-field-sandbox.component';

export const MULTI_SELECT_FIELD_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: MultiSelectFieldOverviewComponent,
  sandbox: MultiSelectFieldSandboxComponent,
};
