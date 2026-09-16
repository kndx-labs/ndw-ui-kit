import {Component, Directive, ChangeDetectionStrategy} from '@angular/core';
import {
  CdkHeaderRowDef,
  CdkFooterRowDef,
  CdkRowDef,
  CdkHeaderRow,
  CdkFooterRow,
  CdkRow,
  CdkNoDataRow,
  CDK_ROW_TEMPLATE,
  CdkCellOutlet,
} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuHeaderRowDef]',
  inputs: [
    {name: 'columns', alias: 'ndwuHeaderRowDef'},
    {name: 'sticky', alias: 'ndwuHeaderRowDefSticky'},
  ],
  providers: [{provide: CdkHeaderRowDef, useExisting: NdwuHeaderRowDef}],
})
export class NdwuHeaderRowDef extends CdkHeaderRowDef {}

@Directive({
  selector: '[ndwuFooterRowDef]',
  inputs: [
    {name: 'columns', alias: 'ndwuFooterRowDef'},
    {name: 'sticky', alias: 'ndwuFooterRowDefSticky'},
  ],
  providers: [{provide: CdkFooterRowDef, useExisting: NdwuFooterRowDef}],
})
export class NdwuFooterRowDef extends CdkFooterRowDef {}

@Directive({
  selector: '[ndwuRowDef]',
  inputs: [
    {name: 'columns', alias: 'ndwuRowDefColumns'},
    {name: 'when', alias: 'ndwuRowDefWhen'},
  ],
  providers: [{provide: CdkRowDef, useExisting: NdwuRowDef}],
})
export class NdwuRowDef<T> extends CdkRowDef<T> {}

@Component({
  selector: 'ndwu-header-row, tr[ndwu-header-row]',
  template: CDK_ROW_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{provide: CdkHeaderRow, useExisting: NdwuHeaderRow}],
  imports: [CdkCellOutlet],
  host: {
    'class': 'ndwu-header-row',
    'role': 'row',
  },
})
export class NdwuHeaderRow extends CdkHeaderRow {}

@Component({
  selector: 'ndwu-footer-row, tr[ndwu-footer-row]',
  template: CDK_ROW_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{provide: CdkFooterRow, useExisting: NdwuFooterRow}],
  imports: [CdkCellOutlet],
  host: {
    'class': 'ndwu-footer-row',
    'role': 'row',
  },
})
export class NdwuFooterRow extends CdkFooterRow {}

@Component({
  selector: 'ndwu-row, tr[ndwu-row]',
  template: CDK_ROW_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{provide: CdkRow, useExisting: NdwuRow}],
  imports: [CdkCellOutlet],
  host: {
    'class': 'ndwu-row',
    'role': 'row',
  },
})
export class NdwuRow extends CdkRow {}

@Directive({
  selector: 'ng-template[ndwuNoDataRow]',
  providers: [{provide: CdkNoDataRow, useExisting: NdwuNoDataRow}],
})
export class NdwuNoDataRow extends CdkNoDataRow {}
