import {NdwuPictogramName} from '../../../pictogram-names';

export type NdwuPictogramSize = 'L' | 'XL';

export const NDWU_PICTOGRAM_SIZE_PRIORITY: readonly NdwuPictogramSize[] = ['XL', 'L'];

export const NDWU_PICTOGRAM_SIZE_FALLBACK: NdwuPictogramSize = 'XL';

type BaseWith<Size extends NdwuPictogramSize, Name = NdwuPictogramName> = Name extends `${infer Base}_${Size}` ? Base
  : never;

export type NdwuPictogramBaseName = Extract<BaseWith<'L'>, BaseWith<'XL'>>;
