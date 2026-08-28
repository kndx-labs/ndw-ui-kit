import type {Type} from '@angular/core';
import {BadgeOverviewComponent} from './overview/badge-overview.component';
import {BadgeSandboxComponent} from './sandbox/badge-sandbox.component';

export const BADGE_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: BadgeOverviewComponent,
  sandbox: BadgeSandboxComponent,
};
