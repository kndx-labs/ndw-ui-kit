import type {Type} from '@angular/core';
import {AutocompleteOverviewComponent} from './overview/autocomplete-overview.component';
import {AutocompleteSandboxComponent} from './sandbox/autocomplete-sandbox.component';

export const AUTOCOMPLETE_TAB_CONTENT: Record<string, Type<unknown>> = {
  overview: AutocompleteOverviewComponent,
  sandbox: AutocompleteSandboxComponent,
};
