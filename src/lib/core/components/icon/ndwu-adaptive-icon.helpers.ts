import {NdwuAllIconName} from '../../../icon-names';

export type NdwuIconSize = 'S' | 'L' | 'XL' | 'XXL';

export const NDWU_ICON_SIZE_PRIORITY: readonly NdwuIconSize[] = ['L', 'S'];

export const NDWU_ICON_SIZE_FALLBACK: NdwuIconSize = 'L';

type BaseWith<Size extends NdwuIconSize, Name = NdwuAllIconName> = Name extends `${infer Base}_${Size}` ? Base : never;

export type NdwuIconBaseName = Extract<BaseWith<'S'>, BaseWith<'L'>>;
