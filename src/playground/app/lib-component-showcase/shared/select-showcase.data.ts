import type {NdwuOption} from '@ndw-ui-kit/core';

export const COUNTRY_OPTIONS: NdwuOption[] = [
  {value: 'de', label: 'Germany'},
  {value: 'ch', label: 'Switzerland'},
  {value: 'at', label: 'Austria'},
];

export const LONG_COUNTRY_LIST = [
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'Colombia',
  'Czech Republic',
  'Denmark',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'India',
  'Ireland',
  'Italy',
  'Japan',
  'Mexico',
  'Netherlands',
  'Norway',
  'Poland',
  'Portugal',
  'Spain',
  'Sweden',
  'Switzerland',
  'United Kingdom',
  'United States',
];

export const COUNTRY_OPTIONS_LONG_LIST: NdwuOption[] = LONG_COUNTRY_LIST.map((name) => {
  return {
    value: name,
    label: name,
  };
});
