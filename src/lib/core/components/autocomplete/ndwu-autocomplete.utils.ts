import type {NdwuAutocompleteFilter} from './ndwu-autocomplete.types';

export const ndwuAutocompleteContainsFilter: NdwuAutocompleteFilter = (option, query) => {
  return option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase());
};
