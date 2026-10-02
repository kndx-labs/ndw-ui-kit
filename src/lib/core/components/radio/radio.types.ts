import {InjectionToken, Signal} from '@angular/core';
import {NdwuSize} from '../../../shared.types';

export interface NdwuRadioGroup {
  readonly disabled: Signal<boolean>;
  readonly required: Signal<boolean>;
  readonly groupName: Signal<string>;
  readonly effectiveSize: Signal<NdwuSize>;

  isSelected(value: string | number): boolean;
  select(value: string | number): void;
}

export const NDWU_RADIO_GROUP = new InjectionToken<NdwuRadioGroup>('NdwuRadioGroup');
