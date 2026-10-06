import {InjectionToken, type Signal, type TemplateRef} from '@angular/core';

/** Tooltip content: plain string (rendered as HTML) or a template rendered with `NDWU_TOOLTIP_CONTEXT`. */
export type NdwuTooltipContent = string | TemplateRef<NdwuTooltipTemplateContext>;

/** Context of a template passed as tooltip content; the consumer's value is `$implicit`. */
export interface NdwuTooltipTemplateContext<C = unknown> {
  $implicit: C;
}

export const NDWU_TOOLTIP_ID = new InjectionToken<string>('NDWU_TOOLTIP_ID');
export const NDWU_TOOLTIP_CONTENT = new InjectionToken<NdwuTooltipContent>('NDWU_TOOLTIP_CONTENT');
/** Template context source; a signal so the open tooltip follows context changes without re-creating. */
export const NDWU_TOOLTIP_CONTEXT = new InjectionToken<Signal<unknown>>('NDWU_TOOLTIP_CONTEXT');
/** When false, the tooltip is not a live region (its text is announced via `aria-describedby`). */
export const NDWU_TOOLTIP_LIVE = new InjectionToken<Signal<boolean>>('NDWU_TOOLTIP_LIVE');
export const NDWU_TOOLTIP_MAX_WIDTH = new InjectionToken<string | null>('NDWU_TOOLTIP_MAX_WIDTH');
