import {Directive, Input, booleanAttribute} from '@angular/core';
import {CdkHeaderRowDef, CdkFooterRowDef, CdkRowDef, CdkNoDataRow} from '@angular/cdk/table';

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

@Directive({
  selector: 'ng-template[ndwuNoDataRow]',
  providers: [{provide: CdkNoDataRow, useExisting: NdwuNoDataRowDirective}],
})
export class NdwuNoDataRowDirective extends CdkNoDataRow {}
