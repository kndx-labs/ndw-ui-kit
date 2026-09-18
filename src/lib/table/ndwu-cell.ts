import {Directive} from '@angular/core';
import {
  CdkCellDef,
  CdkHeaderCellDef,
  CdkFooterCellDef,
  CdkCell,
  CdkHeaderCell,
  CdkFooterCell,
} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuCellDef]',
  providers: [{provide: CdkCellDef, useExisting: NdwuCellDef}],
})
export class NdwuCellDef extends CdkCellDef {}

@Directive({
  selector: '[ndwuHeaderCellDef]',
  providers: [{provide: CdkHeaderCellDef, useExisting: NdwuHeaderCellDef}],
})
export class NdwuHeaderCellDef extends CdkHeaderCellDef {}

@Directive({
  selector: '[ndwuFooterCellDef]',
  providers: [{provide: CdkFooterCellDef, useExisting: NdwuFooterCellDef}],
})
export class NdwuFooterCellDef extends CdkFooterCellDef {}

@Directive({
  selector: 'ndwu-cell, td[ndwu-cell]',
  host: {'class': 'ndwu-cell'},
})
export class NdwuCell extends CdkCell {}

@Directive({
  selector: 'ndwu-header-cell, th[ndwu-header-cell]',
  // `scope` lets assistive tech announce the column name for each cell, which is
  // what gives an unlabelled in-cell control (toggle, checkbox) its context.
  host: {'class': 'ndwu-header-cell', 'scope': 'col'},
})
export class NdwuHeaderCell extends CdkHeaderCell {}

@Directive({
  selector: 'ndwu-footer-cell, td[ndwu-footer-cell]',
  host: {'class': 'ndwu-footer-cell'},
})
export class NdwuFooterCell extends CdkFooterCell {}
