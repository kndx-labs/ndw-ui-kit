import {Directive} from '@angular/core';

@Directive({
  selector: '[ndwuTextareaActions]',
  host: {
    class: 'ndwu-textarea__actions',
  },
})
export class NdwuTextareaActionsDirective {}
