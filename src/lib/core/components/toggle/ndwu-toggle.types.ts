import {NdwuValues} from '../../../shared.types';

export const NDWU_TOGGLE_COLOR = {
  BRAND: 'brand',
  GREEN: 'green',
} as const;

export type NdwuToggleColor = NdwuValues<typeof NDWU_TOGGLE_COLOR>;

export const ndwuCoerceToggleColor = (value: string): NdwuToggleColor => {
  const lowerValue = value.toLowerCase();

  if (
    Object.values(NDWU_TOGGLE_COLOR).map(String)
      .includes(lowerValue)
  ) {
    return lowerValue as NdwuToggleColor;
  }

  return NDWU_TOGGLE_COLOR.BRAND;
};
