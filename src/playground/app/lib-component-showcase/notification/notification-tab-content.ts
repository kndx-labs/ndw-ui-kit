import type {Type} from '@angular/core';
import {NotificationOverviewComponent} from './overview/notification-overview.component';
import {NotificationSandboxComponent} from './sandbox/notification-sandbox.component';

export const NOTIFICATION_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: NotificationOverviewComponent,
  sandbox: NotificationSandboxComponent,
};
