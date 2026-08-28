import {Directive, TemplateRef, inject} from '@angular/core';

/**
 * Marks an `<ng-template>` as the combobox popup content.
 * Attach to the `<ng-template>` that wraps the listbox shown when the combobox expands.
 */
@Directive({
  selector: '[ndwuComboboxPopup]',
})
export class NdwuComboboxPopupDirective {
  public readonly templateRef = inject(TemplateRef);
}
