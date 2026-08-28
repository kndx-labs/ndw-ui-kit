import type {Type} from '@angular/core';
import {ProgressBarOverviewComponent} from './overview/progress-bar-overview.component';
import {ProgressBarSandboxComponent} from './sandbox/progress-bar-sandbox.component';

export const PROGRESS_BAR_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: ProgressBarOverviewComponent,
  sandbox: ProgressBarSandboxComponent,
};
