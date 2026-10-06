import {Directive, TemplateRef, inject} from '@angular/core';

/**
 * Marks lazy accordion item content.
 * The template is rendered on first expand and kept after collapse.
 */
@Directive({
  selector: 'ng-template[ndwuAccordionContent]',
})
export class NdwuAccordionContentDirective {
  public readonly templateRef = inject(TemplateRef);
}
