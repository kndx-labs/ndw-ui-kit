import type {Type} from '@angular/core';
import {TableOverviewComponent} from './overview/table-overview.component';

export const TABLE_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: TableOverviewComponent,
};
