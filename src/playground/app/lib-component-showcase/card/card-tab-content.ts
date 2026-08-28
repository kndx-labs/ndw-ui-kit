import type {Type} from '@angular/core';
import {CardOverviewComponent} from './overview/card-overview.component';
import {CardSandboxComponent} from './sandbox/card-sandbox.component';

export const CARD_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: CardOverviewComponent,
  sandbox: CardSandboxComponent,
};
