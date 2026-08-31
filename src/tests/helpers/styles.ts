const channel = (hex: string, offset: number): number => {
  return Number.parseInt(hex.slice(offset, offset + 2), 16);
};

/**
 * The specification states colours as hex; getComputedStyle reports rgb().
 * Without this every colour assertion fails on formatting rather than value.
 */
export const hexToRgb = (hex: string): string => {
  const value = hex.replace('#', '');
  const full = value.length === 3
    ? [...value].map((c) => `${c}${c}`).join('')
    : value;

  return `rgb(${channel(full, 0)}, ${channel(full, 2)}, ${channel(full, 4)})`;
};

/**
 * The specification assigns letterSpacing L (0) to sizes L and S. The component
 * sets letter-spacing only for XL and XXL, so L and S inherit the initial value
 * and compute to `normal`. Visually identical to 0; textually different.
 */
export const isZeroLetterSpacing = (value: string): boolean => {
  return value === 'normal' || value === '0px';
};
