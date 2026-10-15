import type {NdwuAutocompleteOption, NdwuOptionGroup} from '@ndw-ui-kit/core';

export const AUTOCOMPLETE_GROUPS: readonly NdwuOptionGroup[] = [
  {id: 'articles', label: 'autocomplete-showcase.data.groups.articles'},
  {id: 'settings', label: 'autocomplete-showcase.data.groups.settings'},
];

export const AUTOCOMPLETE_OPTIONS: readonly NdwuAutocompleteOption[] = [
  {value: 'wifi-setup', label: 'Wi-Fi network setup', groupId: 'articles', bullet: true},
  {value: 'wifi-guest', label: 'Guest Wi-Fi network', groupId: 'articles', bullet: true},
  {value: 'wifi-schedule', label: 'Wi-Fi schedule and power saving for wireless access points', groupId: 'articles',
    bullet: true},
  {value: 'mesh', label: 'Mesh Wi-Fi system', groupId: 'articles', bullet: true},
  {value: 'firmware', label: 'Firmware update', groupId: 'articles', bullet: true},
  {value: 'wifi-band', label: 'Wi-Fi band steering', groupId: 'settings'},
  {value: 'wifi-channel', label: 'Wi-Fi channel', groupId: 'settings'},
  {value: 'wifi-password', label: 'Wi-Fi password', groupId: 'settings'},
  {value: 'port-forwarding', label: 'Port forwarding', groupId: 'settings'},
  {value: 'parental-control', label: 'Parental control', groupId: 'settings'},
  {value: 'vpn-server', label: 'VPN server', groupId: 'settings'},
  {value: 'dns', label: 'DNS settings', groupId: 'settings'},
];

export const AUTOCOMPLETE_CITIES: readonly NdwuAutocompleteOption[] = [
  'Amsterdam',
  'Barcelona',
  'Berlin',
  'Bern',
  'Brussels',
  'Budapest',
  'Copenhagen',
  'Dublin',
  'Hamburg',
  'Helsinki',
  'Lisbon',
  'London',
  'Madrid',
  'Milan',
  'Munich',
  'Oslo',
  'Paris',
  'Prague',
  'Rome',
  'Stockholm',
  'Vienna',
  'Warsaw',
  'Zurich',
].map((city) => ({value: city, label: city}));

export const KNOWLEDGE_BASE_URL = 'https://example.com/search';

export const knowledgeBaseSearchUrl = (query: string): string => {
  const trimmed = query.trim();

  return trimmed ? `${KNOWLEDGE_BASE_URL}?query=${encodeURIComponent(trimmed)}` : KNOWLEDGE_BASE_URL;
};
