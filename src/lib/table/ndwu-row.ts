import {Component, Directive, Input, booleanAttribute, ChangeDetectionStrategy} from '@angular/core';
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
  providers: [{provide: CdkHeaderRowDef, useExisting: NdwuHeaderRowDefDirective}],
})
export class NdwuHeaderRowDefDirective extends CdkHeaderRowDef {
  @Input('ndwuHeaderRowDef') public override columns: Iterable<string> = [];

  @Input({alias: 'ndwuHeaderRowDefSticky', transform: booleanAttribute})
  public override get sticky(): boolean {
    return super.sticky;
  }

  public override set sticky(value: boolean) {
    super.sticky = value;
  }
}

@Directive({
  selector: '[ndwuFooterRowDef]',
  providers: [{provide: CdkFooterRowDef, useExisting: NdwuFooterRowDefDirective}],
})
export class NdwuFooterRowDefDirective extends CdkFooterRowDef {
  @Input('ndwuFooterRowDef') public override columns: Iterable<string> = [];

  @Input({alias: 'ndwuFooterRowDefSticky', transform: booleanAttribute})
  public override get sticky(): boolean {
    return super.sticky;
  }

  public override set sticky(value: boolean) {
    super.sticky = value;
  }
}

@Directive({
  selector: '[ndwuRowDef]',
  providers: [{provide: CdkRowDef, useExisting: NdwuRowDefDirective}],
})
export class NdwuRowDefDirective<T> extends CdkRowDef<T> {
  @Input('ndwuRowDefColumns') public override columns: Iterable<string> = [];
  // Undefined means "always", which is what the CDK's own default is.
  @Input('ndwuRowDefWhen') public override when: (index: number, rowData: T) => boolean =
    undefined as unknown as (index: number, rowData: T) => boolean;
}

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

@Directive({
  selector: 'ng-template[ndwuNoDataRow]',
  providers: [{provide: CdkNoDataRow, useExisting: NdwuNoDataRowDirective}],
})
export class NdwuNoDataRowDirective extends CdkNoDataRow {}
