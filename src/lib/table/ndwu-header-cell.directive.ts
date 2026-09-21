import {Directive} from '@angular/core';
import {CdkHeaderCell} from '@angular/cdk/table';

@Directive({
  selector: 'th[ndwuHeaderCell], ndwu-header-cell',
  // `scope` lets assistive tech announce the column name for each cell, which is
  // what gives an unlabelled in-cell control (toggle, checkbox) its context.
  host: {class: 'ndwu-header-cell', scope: 'col'},
})
export class NdwuHeaderCellDirective extends CdkHeaderCell {}
