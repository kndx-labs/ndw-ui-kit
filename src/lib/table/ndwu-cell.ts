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
  providers: [{provide: CdkCellDef, useExisting: NdwuCellDefDirective}],
})
export class NdwuCellDefDirective extends CdkCellDef {}

@Directive({
  selector: '[ndwuHeaderCellDef]',
  providers: [{provide: CdkHeaderCellDef, useExisting: NdwuHeaderCellDefDirective}],
})
export class NdwuHeaderCellDefDirective extends CdkHeaderCellDef {}

@Directive({
  selector: '[ndwuFooterCellDef]',
  providers: [{provide: CdkFooterCellDef, useExisting: NdwuFooterCellDefDirective}],
})
export class NdwuFooterCellDefDirective extends CdkFooterCellDef {}

@Directive({
  selector: 'td[ndwuCell], ndwu-cell',
  host: {'class': 'ndwu-cell'},
})
export class NdwuCellDirective extends CdkCell {}

@Directive({
  selector: 'th[ndwuHeaderCell], ndwu-header-cell',
  // `scope` lets assistive tech announce the column name for each cell, which is
  // what gives an unlabelled in-cell control (toggle, checkbox) its context.
  host: {'class': 'ndwu-header-cell', 'scope': 'col'},
})
export class NdwuHeaderCellDirective extends CdkHeaderCell {}

@Directive({
  selector: 'td[ndwuFooterCell], ndwu-footer-cell',
  host: {'class': 'ndwu-footer-cell'},
})
export class NdwuFooterCellDirective extends CdkFooterCell {}
