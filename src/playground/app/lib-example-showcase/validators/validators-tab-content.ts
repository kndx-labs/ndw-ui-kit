import type {Type} from '@angular/core';
import {ValidatorsOverviewComponent} from './overview/validators-overview.component';

export const VALIDATORS_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: ValidatorsOverviewComponent,
};
