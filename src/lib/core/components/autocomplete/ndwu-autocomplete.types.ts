import type {NdwuOption} from '../../../shared.types';

export type NdwuAutocompleteOption = NdwuOption;

export type NdwuAutocompleteFilter = (option: NdwuAutocompleteOption, query: string) => boolean;
