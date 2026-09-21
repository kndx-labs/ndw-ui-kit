import {Component, ChangeDetectionStrategy} from '@angular/core';
import {CdkHeaderRow, CdkFooterRow, CdkRow, CDK_ROW_TEMPLATE, CdkCellOutlet} from '@angular/cdk/table';

@Component({
  selector: 'ndwu-header-row, tr[ndwu-header-row]',
  template: CDK_ROW_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{provide: CdkHeaderRow, useExisting: NdwuHeaderRowComponent}],
  imports: [CdkCellOutlet],
  host: {
    class: 'ndwu-header-row',
    role: 'row',
  },
})
export class NdwuHeaderRowComponent extends CdkHeaderRow {}

@Component({
  selector: 'ndwu-footer-row, tr[ndwu-footer-row]',
  template: CDK_ROW_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{provide: CdkFooterRow, useExisting: NdwuFooterRowComponent}],
  imports: [CdkCellOutlet],
  host: {
    class: 'ndwu-footer-row',
    role: 'row',
  },
})
export class NdwuFooterRowComponent extends CdkFooterRow {}

@Component({
  selector: 'ndwu-row, tr[ndwu-row]',
  template: CDK_ROW_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{provide: CdkRow, useExisting: NdwuRowComponent}],
  imports: [CdkCellOutlet],
  host: {
    class: 'ndwu-row',
    role: 'row',
  },
})
export class NdwuRowComponent extends CdkRow {}
