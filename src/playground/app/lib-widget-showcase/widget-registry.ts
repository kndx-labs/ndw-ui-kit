import type {Type} from '@angular/core';
import type {WidgetName} from '@app/app.types';
import {EmptyStateShowcaseComponent} from './empty-state/empty-state-showcase.component';

export const WIDGET_COMPONENTS: Record<WidgetName, Type<unknown>> = {
  'ndwu-empty-state': EmptyStateShowcaseComponent,
};
