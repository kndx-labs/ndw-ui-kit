import type {Type} from '@angular/core';
import {TooltipOverviewComponent} from './overview/tooltip-overview.component';
import {TooltipSandboxComponent} from './sandbox/tooltip-sandbox.component';

export const TOOLTIP_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: TooltipOverviewComponent,
  sandbox: TooltipSandboxComponent,
};
