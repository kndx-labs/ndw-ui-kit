import {Directive} from '@angular/core';
import {CdkFooterCell} from '@angular/cdk/table';

@Directive({
  selector: 'td[ndwuFooterCell], ndwu-footer-cell',
  host: {class: 'ndwu-footer-cell'},
})
export class NdwuFooterCellDirective extends CdkFooterCell {}
