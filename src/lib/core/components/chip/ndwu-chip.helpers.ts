import {NDWU_SIZE, type NdwuSize} from '../../../shared.types';

/** Chip renders at two sizes only; every other inherited size collapses to one of them. */
export type NdwuChipSize = Extract<NdwuSize, 'L' | 'XL'>;

export function ndwuToChipSize(size: NdwuSize): NdwuChipSize {
  return size === NDWU_SIZE.XL || size === NDWU_SIZE.XXL ? NDWU_SIZE.XL : NDWU_SIZE.L;
}
