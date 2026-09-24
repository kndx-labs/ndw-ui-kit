import {SIZE, type Size} from '../../../shared.types';

/** Chip renders at two sizes only; every other inherited size collapses to one of them. */
export type ChipSize = Extract<Size, 'L' | 'XL'>;

export function toChipSize(size: Size): ChipSize {
  return size === SIZE.XL || size === SIZE.XXL ? SIZE.XL : SIZE.L;
}
