import type {Type} from '@angular/core';
import {ToggleOverviewComponent} from './overview/toggle-overview.component';
import {ToggleSandboxPreviewComponent} from './sandbox/toggle-sandbox-preview.component';

export const TOGGLE_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: ToggleOverviewComponent,
  sandbox: ToggleSandboxPreviewComponent,
};
