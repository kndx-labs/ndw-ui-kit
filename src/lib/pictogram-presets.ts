export const PICTOGRAM_VARIANTS = {
  DEFAULT: {
    firstColor: '#219CDE',
    secondColor: '#E0EEFD',
  },
  INFO: {
    firstColor: '#219CDE',
    secondColor: '#CDE4FC',
  },
  SUCCESS: {
    firstColor: '#66AC20',
    secondColor: '#D4ECBD',
  },
  WARNING: {
    firstColor: '#EA354C',
    secondColor: '#FFCCD3',
  },
  DISABLED: {
    firstColor: '#797D89',
    secondColor: '#D0D4DA',
  },
} as const;

export type NdwuPictogramVariant = keyof typeof PICTOGRAM_VARIANTS;
