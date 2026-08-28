import type {Type} from '@angular/core';
import {PopoverOverviewComponent} from './overview/popover-overview.component';
import {PopoverSandboxComponent} from './sandbox/popover-sandbox.component';

export const POPOVER_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: PopoverOverviewComponent,
  sandbox: PopoverSandboxComponent,
};
