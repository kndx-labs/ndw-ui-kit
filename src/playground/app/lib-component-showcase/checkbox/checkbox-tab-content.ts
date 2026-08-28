import type {Type} from '@angular/core';
import {CheckboxOverviewComponent} from './overview/checkbox-overview.component';
import {CheckboxSandboxPreviewComponent} from './sandbox/checkbox-sandbox-preview.component';

export const CHECKBOX_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: CheckboxOverviewComponent,
  sandbox: CheckboxSandboxPreviewComponent,
};
