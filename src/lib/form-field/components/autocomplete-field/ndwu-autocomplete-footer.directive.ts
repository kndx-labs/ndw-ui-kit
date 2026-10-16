import {Directive, TemplateRef, inject} from '@angular/core';

@Directive({
  selector: 'ng-template[ndwuAutocompleteFooter]',
})
export class NdwuAutocompleteFooterDirective {
  public readonly templateRef = inject(TemplateRef);
}
