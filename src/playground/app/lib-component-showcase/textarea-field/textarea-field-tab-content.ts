import type {Type} from '@angular/core';
import {TextareaFieldOverviewComponent} from './overview/textarea-field-overview.component';
import {TextareaFieldSandboxComponent} from './sandbox/textarea-field-sandbox.component';

export const TEXTAREA_FIELD_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: TextareaFieldOverviewComponent,
  sandbox: TextareaFieldSandboxComponent,
};
