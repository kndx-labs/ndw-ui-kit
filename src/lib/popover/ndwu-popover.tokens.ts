import {InjectionToken, type Signal} from '@angular/core';
import type {NdwuDynamicContent, NdwuPopoverTriggerType} from './ndwu-popover.types';

/**
 * Optional defaults for trigger behavior (e.g. tooltip provides hover/focus).
 * Precedence: consumer input > this token > trigger hardcoded fallback.
 */
export interface NdwuPopoverTriggerDefaults {
  triggerOn?: NdwuPopoverTriggerType | NdwuPopoverTriggerType[];
  showDelay?: number;
  hideDelay?: number;
  popoverClass?: string | string[];
  popoverTrapFocus?: boolean;
}

export const NDWU_POPOVER_TRIGGER_DEFAULTS = new InjectionToken<NdwuPopoverTriggerDefaults | null>(
  'NDWU_POPOVER_TRIGGER_DEFAULTS',
);

/**
 * Optional: when ndwuPopoverTrigger input is null,
 * the trigger may use this factory to get content (e.g. for ndwuTooltip).
 */
export const NDWU_POPOVER_DEFAULT_CONTENT = new InjectionToken<() => NdwuDynamicContent<unknown>>(
  'NDWU_POPOVER_DEFAULT_CONTENT',
);

export const NDWU_POPOVER_CONTENT = new InjectionToken<NdwuDynamicContent<unknown>>(
  'NDWU_POPOVER_CONTENT',
);

/** Signal-wrapped context for reactivity when content re-renders. */
export const NDWU_POPOVER_CONTEXT = new InjectionToken<Signal<unknown>>(
  'NDWU_POPOVER_CONTEXT',
);

/**
 * When true, focus is trapped inside the panel.
 * When false, e.g. autocomplete, focus stays on trigger. Default false.
 */
export const NDWU_POPOVER_TRAP_FOCUS = new InjectionToken<boolean>(
  'NDWU_POPOVER_TRAP_FOCUS',
);
