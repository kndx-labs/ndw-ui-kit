import {NdwuValues} from '../../../shared.types';

export const TOGGLE_COLOR = {
  BRAND: 'brand',
  GREEN: 'green',
} as const;

export type NdwuToggleColor = NdwuValues<typeof TOGGLE_COLOR>;

export const coerceToggleColor = (value: string): NdwuToggleColor => {
  const lowerValue = value.toLowerCase();

  if (
    Object.values(TOGGLE_COLOR).map(String)
      .includes(lowerValue)
  ) {
    return lowerValue as NdwuToggleColor;
  }

  return TOGGLE_COLOR.BRAND;
};
