import type {Type} from '@angular/core';
import {TabsOverviewComponent} from './overview/tabs-overview.component';
import {TabsSandboxComponent} from './sandbox/tabs-sandbox.component';

export const TABS_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: TabsOverviewComponent,
  sandbox: TabsSandboxComponent,
};
