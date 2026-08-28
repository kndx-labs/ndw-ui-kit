import type {Type} from '@angular/core';
import {PictogramOverviewComponent} from './overview/pictogram-overview.component';
import {PictogramSandboxComponent} from './sandbox/pictogram-sandbox.component';

export const PICTOGRAM_TABS = [
  {id: 'overview', label: 'Overview'},
  {id: 'sandbox', label: 'Sandbox'},
] as const;

export const PICTOGRAM_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: PictogramOverviewComponent,
  sandbox: PictogramSandboxComponent,
};
