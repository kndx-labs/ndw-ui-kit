import {PictogramName} from '../../../pictogram-names';

export type PictogramSize = 'L' | 'XL';

export const PICTOGRAM_SIZE_PRIORITY: readonly PictogramSize[] = ['XL', 'L'];

export const PICTOGRAM_SIZE_FALLBACK: PictogramSize = 'XL';

type BaseWith<Size extends PictogramSize, Name = PictogramName> = Name extends `${infer Base}_${Size}` ? Base : never;

export type PictogramBaseName = Extract<BaseWith<'L'>, BaseWith<'XL'>>;
