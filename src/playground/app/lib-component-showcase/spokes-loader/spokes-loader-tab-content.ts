import type {Type} from '@angular/core';
import {SpokesLoaderSandboxComponent} from './sandbox/spokes-loader-sandbox.component';

export const SPOKES_LOADER_TAB_CONTENT: Record<string, Type<unknown>> = {
  sandbox: SpokesLoaderSandboxComponent,
};
