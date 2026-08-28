import {InjectionToken, Signal} from '@angular/core';
import {Size} from '../../../shared.types';

export interface NdwuRadioGroup {
  readonly disabled: Signal<boolean>;
  readonly groupName: Signal<string>;
  readonly effectiveSize: Signal<Size>;

  isSelected(value: string | number): boolean;
  select(value: string | number): void;
}

export const NDWU_RADIO_GROUP = new InjectionToken<NdwuRadioGroup>('NdwuRadioGroup');
