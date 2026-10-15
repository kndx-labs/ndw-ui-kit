import type {NdwuOption} from '../../../shared.types';

export interface NdwuAutocompleteOption extends NdwuOption {
  bullet?: boolean;
}

export type NdwuAutocompleteFilter = (option: NdwuAutocompleteOption, query: string) => boolean;

export type NdwuAutocompleteRow =
  | {kind: 'group'; id: string; label: string}
  | {kind: 'option'; option: NdwuAutocompleteOption};
