import type {Type} from '@angular/core';
import {IconButtonOverviewComponent} from './overview/icon-button-overview.component';
import {IconButtonSandboxComponent} from './sandbox/icon-button-sandbox.component';

export const ICON_BUTTON_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: IconButtonOverviewComponent,
  sandbox: IconButtonSandboxComponent,
};
