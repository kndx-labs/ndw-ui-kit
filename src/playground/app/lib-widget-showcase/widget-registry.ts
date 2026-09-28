import type {Type} from '@angular/core';
import type {WidgetName} from '@app/app.types';
import {EmptyStateShowcaseComponent} from './empty-state/empty-state-showcase.component';
import {FileUploadShowcaseComponent} from './file-upload/file-upload-showcase.component';
import {ScheduleEditorShowcaseComponent} from './schedule-editor/schedule-editor-showcase.component';

export const WIDGET_COMPONENTS: Record<WidgetName, Type<unknown>> = {
  'ndwu-empty-state': EmptyStateShowcaseComponent,
  'ndwu-file-upload': FileUploadShowcaseComponent,
  'ndwu-schedule-editor': ScheduleEditorShowcaseComponent,
};
