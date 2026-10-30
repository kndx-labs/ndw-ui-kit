import type {Type} from '@angular/core';
import {TextareaOverviewComponent} from './overview/textarea-overview.component';
import {TextareaResizeWidthComponent} from './resize-width/textarea-resize-width.component';
import {TextareaSandboxComponent} from './sandbox/textarea-sandbox.component';

export const TEXTAREA_TAB_CONTENT: Record<string, Type<unknown>> = {
  'overview': TextareaOverviewComponent,
  'sandbox': TextareaSandboxComponent,
  'resize-width': TextareaResizeWidthComponent,
};
