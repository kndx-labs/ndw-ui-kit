import type {Type} from '@angular/core';
import {TagOverviewComponent} from './overview/tag-overview.component';
import {TagSandboxComponent} from './sandbox/tag-sandbox.component';

export const TAG_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: TagOverviewComponent,
  sandbox: TagSandboxComponent,
};
