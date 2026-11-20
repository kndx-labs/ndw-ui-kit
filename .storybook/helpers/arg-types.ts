import {
  NDWU_ICON_NAMES,
  NDWU_PICTOGRAM_NAME,
  NDWU_PICTOGRAM_VARIANTS,
  NdwuPictogramBaseName,
  NdwuPictogramName,
  NdwuPictogramVariant,
  NdwuSize,
} from '@ndw-ui-kit/core';
import {ArgTypes} from '@storybook/angular';
import {AdaptiveSizeMode} from './story-args';

type ArgType = ArgTypes[string];

const ADAPTIVE_SIZE_MODES: readonly AdaptiveSizeMode[] = ['unbound', 'viewport'];

export const sizeArgType = (sizes: readonly NdwuSize[]): ArgType => {
  return {
    description: 'Component size. `inherit` takes it from the Size toolbar or the nearest size provider, else `XL`',
    control: {
      type: 'select',
      labels: {undefined: 'inherit'},
    },
    options: [undefined, ...sizes],
    table: {
      category: 'inputs',
      type: {summary: 'NdwuSize'},
      defaultValue: {summary: 'inherit'},
    },
  };
};

export const adaptiveSizeArgType = (description: string): ArgType => {
  return {
    control: 'select',
    options: ADAPTIVE_SIZE_MODES,
    description,
    table: {
      category: 'inputs',
      type: {summary: 'NdwuSizeFlags'},
      defaultValue: {summary: 'unbound'},
    },
  };
};

export const iconArgType: ArgType = {
  control: {
    type: 'select',
    labels: {null: 'none'},
  },
  options: [null, ...NDWU_ICON_NAMES],
};

const isPictogramVariant = (key: string): key is NdwuPictogramVariant => {
  return key in NDWU_PICTOGRAM_VARIANTS;
};

export const PICTOGRAM_VARIANTS: readonly NdwuPictogramVariant[] = Object.keys(NDWU_PICTOGRAM_VARIANTS).filter(
  isPictogramVariant,
);

const PICTOGRAM_NAMES: readonly NdwuPictogramName[] = Object.values(NDWU_PICTOGRAM_NAME);

const PICTOGRAM_NAME_SET: ReadonlySet<string> = new Set(PICTOGRAM_NAMES);

const isPictogramBaseName = (base: string): base is NdwuPictogramBaseName => {
  return PICTOGRAM_NAME_SET.has(`${base}_L`) && PICTOGRAM_NAME_SET.has(`${base}_XL`);
};

export const PICTOGRAM_BASE_NAMES: readonly NdwuPictogramBaseName[] = PICTOGRAM_NAMES
  .filter((name) => name.endsWith('_XL'))
  .map((name) => name.slice(0, -3))
  .filter(isPictogramBaseName);

export const pictogramBaseNameArgType: ArgType = {
  control: 'select',
  options: PICTOGRAM_BASE_NAMES,
};

export const pictogramVariantArgType: ArgType = {
  control: 'select',
  options: PICTOGRAM_VARIANTS,
};

export const textArgType = (description: string): ArgType => {
  return {
    control: 'text',
    description,
  };
};

export const booleanArgType = (description: string): ArgType => {
  return {
    control: 'boolean',
    description,
  };
};

export const outputArgType = (name: string, description: string): ArgType => {
  return {
    action: name,
    description,
    table: {category: 'outputs'},
  };
};

export const eventArgType = (name: string, description: string): ArgType => {
  return {
    action: name,
    description,
    table: {category: 'events'},
  };
};
