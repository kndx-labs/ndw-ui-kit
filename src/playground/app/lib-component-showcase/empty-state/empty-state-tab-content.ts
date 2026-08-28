import {Type} from '@angular/core';
import {EmptyStateOverviewComponent} from './overview/empty-state-overview.component';
import {EmptyStateSandboxComponent} from './sandbox/empty-state-sandbox.component';

export const EMPTY_STATE_TABS = [
  {id: 'overview', label: 'Overview'},
  {id: 'sandbox', label: 'Sandbox'},
] as const;

export const EMPTY_STATE_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: EmptyStateOverviewComponent,
  sandbox: EmptyStateSandboxComponent,
};
