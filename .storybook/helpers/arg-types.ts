import {NDWU_ICON_NAMES, NdwuSize} from '@ndw-ui-kit/core';
import {ArgTypes} from '@storybook/angular';

type ArgType = ArgTypes[string];

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

export const iconArgType: ArgType = {
  control: {
    type: 'select',
    labels: {null: 'none'},
  },
  options: [null, ...NDWU_ICON_NAMES],
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
