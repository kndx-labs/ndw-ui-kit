import type {Type} from '@angular/core';
import {InputOverviewComponent} from './overview/input-overview.component';
import {InputSandboxPreviewComponent} from './sandbox/input-sandbox-preview.component';

export const INPUT_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: InputOverviewComponent,
  sandbox: InputSandboxPreviewComponent,
};
