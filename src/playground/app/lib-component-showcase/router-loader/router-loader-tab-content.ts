import type {Type} from '@angular/core';
import {RouterLoaderOverviewComponent} from './overview/router-loader-overview.component';

export const ROUTER_LOADER_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: RouterLoaderOverviewComponent,
};
