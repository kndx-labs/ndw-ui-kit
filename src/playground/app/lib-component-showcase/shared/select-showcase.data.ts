import type {NdwuOption, NdwuOptionGroup} from '@ndw-ui-kit/core';

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

// One option is `hidden`, but selected by default — it must still show
// in the trigger while being absent from the list.
export const COUNTRY_OPTIONS_WITH_HIDDEN: NdwuOption[] = [
  {value: 'de', label: 'Germany'},
  {value: 'ch', label: 'Switzerland'},
  {value: 'at', label: 'Austria'},
  {value: 'legacy-region', label: 'Legacy region (hidden)', hidden: true},
];

export const CONTINENT_GROUPS: NdwuOptionGroup[] = [
  {id: 'europe', label: 'Europe'},
  {id: 'americas', label: 'Americas'},
];

// A couple of options carry no `groupId` — they exercise the ungrouped
// (bottom, no-subheader) section.
export const COUNTRY_OPTIONS_GROUPED: NdwuOption[] = [
  {value: 'de', label: 'Germany', groupId: 'europe'},
  {value: 'ch', label: 'Switzerland', groupId: 'europe'},
  {value: 'at', label: 'Austria', groupId: 'europe'},
  {value: 'us', label: 'United States', groupId: 'americas'},
  {value: 'ca', label: 'Canada', groupId: 'americas'},
  {value: 'other-1', label: 'Other region A'},
  {value: 'other-2', label: 'Other region B'},
];

// Labels here are user-provided content (e.g. free-text tags), not
// localization keys — used to demonstrate `localizeLabels="false"`.
export const USER_PROVIDED_LABEL_OPTIONS: NdwuOption[] = [
  {value: 'tag-1', label: 'Client: Acme Corp'},
  {value: 'tag-2', label: 'Client: Globex Inc'},
  {value: 'tag-3', label: 'Client: Initech'},
];
