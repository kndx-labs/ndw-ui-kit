import {Directive, inject} from '@angular/core';
import {NdwuResizeObserverDirective} from '@ndw-ui-kit/core';

@Directive({
  selector: '[ndwuTextareaActions]',
  hostDirectives: [NdwuResizeObserverDirective],
  host: {
    class: 'ndwu-textarea-field__actions',
  },
})
export class NdwuTextareaActionsDirective {
  public readonly size = inject(NdwuResizeObserverDirective);
}
