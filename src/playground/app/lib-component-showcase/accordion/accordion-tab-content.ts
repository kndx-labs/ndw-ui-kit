import type {Type} from '@angular/core';
import {AccordionOverviewComponent} from './overview/accordion-overview.component';

export const ACCORDION_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: AccordionOverviewComponent,
};
