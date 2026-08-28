import {AllIconName} from '../../../icon-names';

export type IconSize = 'S' | 'L' | 'XL' | 'XXL';

export const ICON_SIZE_PRIORITY: readonly IconSize[] = ['L', 'S'];

export const ICON_SIZE_FALLBACK: IconSize = 'L';

type BaseWith<Size extends IconSize, Name = AllIconName> = Name extends `${infer Base}_${Size}` ? Base : never;

export type IconBaseName = Extract<BaseWith<'S'>, BaseWith<'L'>>;
