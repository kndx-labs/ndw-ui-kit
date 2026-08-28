import type {Type} from '@angular/core';
import {TimingButtonOverviewComponent} from './overview/timing-button-overview.component';
import {TimingButtonSandboxComponent} from './sandbox/timing-button-sandbox.component';

export const TIMING_BUTTON_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: TimingButtonOverviewComponent,
  sandbox: TimingButtonSandboxComponent,
};
