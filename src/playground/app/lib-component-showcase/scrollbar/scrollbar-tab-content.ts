import {Type} from '@angular/core';
import {ScrollbarOverviewComponent} from './overview/scrollbar-overview.component';

export const SCROLLBAR_TABS = [
  {id: 'overview', label: 'Overview'},
] as const;

export const SCROLLBAR_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: ScrollbarOverviewComponent,
};
