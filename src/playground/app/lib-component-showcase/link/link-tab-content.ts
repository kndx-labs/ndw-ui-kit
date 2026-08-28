import type {Type} from '@angular/core';
import {LinkOverviewComponent} from './overview/link-overview.component';
import {LinkSandboxComponent} from './sandbox/link-sandbox.component';

export const LINK_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: LinkOverviewComponent,
  sandbox: LinkSandboxComponent,
};
