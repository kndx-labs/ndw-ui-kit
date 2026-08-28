import {Values} from '../../../shared.types';

export const TOGGLE_COLOR = {
  BRAND: 'brand',
  GREEN: 'green',
} as const;

export type ToggleColor = Values<typeof TOGGLE_COLOR>;

export const coerceToggleColor = (value: string): ToggleColor => {
  const lowerValue = value.toLowerCase();

  if (
    Object.values(TOGGLE_COLOR).map(String)
      .includes(lowerValue)
  ) {
    return lowerValue as ToggleColor;
  }

  return TOGGLE_COLOR.BRAND;
};
