import type {Type} from '@angular/core';
import {ButtonOverviewComponent} from './overview/button-overview.component';
import {ButtonSandboxComponent} from './sandbox/button-sandbox.component';

export const BUTTON_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: ButtonOverviewComponent,
  sandbox: ButtonSandboxComponent,
};
