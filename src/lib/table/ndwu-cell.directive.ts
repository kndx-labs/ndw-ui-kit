import {Directive} from '@angular/core';
import {CdkCell} from '@angular/cdk/table';

@Directive({
  selector: 'td[ndwuCell], ndwu-cell',
  host: {class: 'ndwu-cell'},
})
export class NdwuCellDirective extends CdkCell {}
