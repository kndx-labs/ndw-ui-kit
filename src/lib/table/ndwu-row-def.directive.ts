import {Directive, Input} from '@angular/core';
import {CdkRowDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuRowDef]',
  providers: [{provide: CdkRowDef, useExisting: NdwuRowDefDirective}],
})
export class NdwuRowDefDirective<T> extends CdkRowDef<T> {
  // `columns` and `when` come from the CDK base class, so they keep the
  // decorator API: a signal input cannot override an inherited member.
  @Input('ndwuRowDefColumns') public override columns: Iterable<string> = [];
  // Undefined means "always", which is what the CDK's own default is.
  @Input('ndwuRowDefWhen') public override when: (index: number, rowData: T) => boolean =
    undefined as unknown as (index: number, rowData: T) => boolean;
}
