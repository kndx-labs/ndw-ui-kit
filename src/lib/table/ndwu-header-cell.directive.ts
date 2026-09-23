import {Directive} from '@angular/core';
import {CdkHeaderCell} from '@angular/cdk/table';

@Directive({
  selector: 'th[ndwuHeaderCell], ndwu-header-cell',
  // `scope` names the column for unlabelled controls in its cells.
  host: {class: 'ndwu-header-cell', scope: 'col'},
})
export class NdwuHeaderCellDirective extends CdkHeaderCell {}
