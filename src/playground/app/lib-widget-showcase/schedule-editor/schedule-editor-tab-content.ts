import type {Type} from '@angular/core';
import {ScheduleEditorCvaPreviewComponent} from './cva/schedule-editor-cva-preview.component';
import {ScheduleEditorOverviewComponent} from './overview/schedule-editor-overview.component';

export const SCHEDULE_EDITOR_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: ScheduleEditorOverviewComponent,
  cva: ScheduleEditorCvaPreviewComponent,
};
