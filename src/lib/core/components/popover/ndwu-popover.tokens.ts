import {InjectionToken, type TemplateRef} from '@angular/core';
import type {NdwuPopoverButton} from './ndwu-popover.types';

export const NDWU_POPOVER_BODY = new InjectionToken<TemplateRef<unknown> | string | null>('NDWU_POPOVER_BODY');
export const NDWU_POPOVER_ID = new InjectionToken<string>('NDWU_POPOVER_ID');
export const NDWU_POPOVER_TITLE = new InjectionToken<string | null>('NDWU_POPOVER_TITLE');
export const NDWU_POPOVER_SHOW_HEADER = new InjectionToken<boolean>('NDWU_POPOVER_SHOW_HEADER');
export const NDWU_POPOVER_SHOW_CLOSE = new InjectionToken<boolean>('NDWU_POPOVER_SHOW_CLOSE');
export const NDWU_POPOVER_CLOSE_ARIA_LABEL = new InjectionToken<string>('NDWU_POPOVER_CLOSE_ARIA_LABEL');
export const NDWU_POPOVER_BUTTONS = new InjectionToken<NdwuPopoverButton[]>('NDWU_POPOVER_BUTTONS');
export const NDWU_POPOVER_CLOSE_FN = new InjectionToken<() => void>('NDWU_POPOVER_CLOSE_FN');
