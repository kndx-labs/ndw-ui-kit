import {Directive, TemplateRef, inject} from '@angular/core';
import type {NdwuOption} from '@ndw-ui-kit/core';

/**
 * Context passed to a custom display template for the multi-select trigger text.
 *
 * - `selectedOptions` / `allOptions` hold the **original** user-provided domain objects.
 * - `normalizedOptions` holds the **UI-ready** `NdwuOption[]`.
 * - `selectedValues` holds the current form control value.
 */
export interface NdwuMultiSelectDisplayContext<T = NdwuOption> {
  empty: boolean;
  selectedValues: readonly (string | number)[];

  normalizedOptions: readonly NdwuOption[];

  selectedOptions: readonly T[];
  allOptions: readonly T[];
}

/**
 * Place on an instance of ng-template to provide custom trigger display content for ndwu-multi-select-field.
 * The template receives NdwuMultiSelectDisplayContext, e.g.:
 *   let-normalizedOptions="normalizedOptions"
 *   let-selectedOptions="selectedOptions"
 *   let-allOptions="allOptions"
 *   let-selectedValues="selectedValues"
 *   let-empty="empty"
 */
@Directive({
  selector: '[ndwuMultiSelectDisplay]',
})
export class NdwuMultiSelectDisplayDirective {
  public readonly templateRef = inject(TemplateRef) as TemplateRef<NdwuMultiSelectDisplayContext>;
}
