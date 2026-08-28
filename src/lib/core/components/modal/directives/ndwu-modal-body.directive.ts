import {Directive, HostBinding} from '@angular/core';
import {NDWU_MODAL_CSS_CLASS} from '../ndwu-modal.constants';

@Directive({
  selector: '[ndwuModalBody]',
})
export class NdwuModalBodyDirective {
  @HostBinding(`class.${NDWU_MODAL_CSS_CLASS}__body`)
  protected readonly bodyClass = true;
}
