import type {Type} from '@angular/core';
import {RadioOverviewComponent} from './overview/radio-overview.component';
import {RadioSandboxPreviewComponent} from './sandbox/radio-sandbox-preview.component';

export const RADIO_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: RadioOverviewComponent,
  sandbox: RadioSandboxPreviewComponent,
};
