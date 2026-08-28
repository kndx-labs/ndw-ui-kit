import {Directive, HostBinding} from '@angular/core';
import {NDWU_MODAL_CSS_CLASS} from '../ndwu-modal.constants';

@Directive({
  selector: '[ndwuModalActions]',
})
export class NdwuModalActionsDirective {
  @HostBinding(`class.${NDWU_MODAL_CSS_CLASS}__actions`)
  protected readonly actionsClass = true;
}
