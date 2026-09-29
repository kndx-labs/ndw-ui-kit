import type {Type} from '@angular/core';
import {FileUploadOverviewComponent} from './overview/file-upload-overview.component';

export const FILE_UPLOAD_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: FileUploadOverviewComponent,
};
