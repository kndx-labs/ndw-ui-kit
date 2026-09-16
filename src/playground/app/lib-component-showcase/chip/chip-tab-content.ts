import type {Type} from '@angular/core';
import {ChipOverviewComponent} from './overview/chip-overview.component';
import {ChipSandboxComponent} from './sandbox/chip-sandbox.component';

export const CHIP_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: ChipOverviewComponent,
  sandbox: ChipSandboxComponent,
};
