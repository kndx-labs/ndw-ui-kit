import type {Type} from '@angular/core';
import {HeatStripOverviewComponent} from './overview/heat-strip-overview.component';

export const HEAT_STRIP_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: HeatStripOverviewComponent,
};
