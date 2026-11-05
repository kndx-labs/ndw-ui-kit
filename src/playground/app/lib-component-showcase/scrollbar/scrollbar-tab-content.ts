import {Type} from '@angular/core';
import {ScrollbarOverviewComponent} from './overview/scrollbar-overview.component';
import {ScrollbarTouchComponent} from './touch/scrollbar-touch.component';

export const SCROLLBAR_TABS = [
  {id: 'overview', label: 'Overview'},
  {id: 'touch', label: 'Touch'},
] as const;

export const SCROLLBAR_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: ScrollbarOverviewComponent,
  touch: ScrollbarTouchComponent,
};
