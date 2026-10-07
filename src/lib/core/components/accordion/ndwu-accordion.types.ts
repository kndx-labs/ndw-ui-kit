import {InjectionToken, type Signal} from '@angular/core';

export const NDWU_ACCORDION_CHEVRON_POSITION = {
  START: 'start',
  END: 'end',
} as const;

export type NdwuAccordionChevronPosition =
  (typeof NDWU_ACCORDION_CHEVRON_POSITION)[keyof typeof NDWU_ACCORDION_CHEVRON_POSITION];

/** Parent accordion API available to `ndwu-accordion-item`. */
export interface NdwuAccordionParent {
  readonly chevronPosition: Signal<NdwuAccordionChevronPosition>;
}

export const NDWU_ACCORDION = new InjectionToken<NdwuAccordionParent>('NDWU_ACCORDION');
