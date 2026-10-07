import {InjectionToken} from '@angular/core';
import type {NdwuLocalizableHtml} from '@ndw-ui-kit/core/l10n';

export const NDWU_TOOLTIP_ID = new InjectionToken<string>('NDWU_TOOLTIP_ID');
export const NDWU_TOOLTIP_CONTENT = new InjectionToken<NdwuLocalizableHtml>('NDWU_TOOLTIP_CONTENT');
export const NDWU_TOOLTIP_MAX_WIDTH = new InjectionToken<string | null>('NDWU_TOOLTIP_MAX_WIDTH');
