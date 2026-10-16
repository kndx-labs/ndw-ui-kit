import type {NdwuOption} from '../../../shared.types';

export interface NdwuAutocompleteOption extends NdwuOption {
  bullet?: boolean;
}

export type NdwuAutocompleteFilter = (option: NdwuAutocompleteOption, query: string) => boolean;
