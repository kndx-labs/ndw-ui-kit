import {NDWU_SIZE, type NdwuSize} from '../../../shared.types';

export type NdwuTagSize = Extract<NdwuSize, 'L' | 'XL'>;

export function ndwuToTagSize(size: NdwuSize): NdwuTagSize {
  return size === NDWU_SIZE.XL || size === NDWU_SIZE.XXL ? NDWU_SIZE.XL : NDWU_SIZE.L;
}
