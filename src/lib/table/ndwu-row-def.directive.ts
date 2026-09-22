import {Directive, Input} from '@angular/core';
import {CdkRowDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuRowDef]',
  providers: [{
    provide: CdkRowDef,
    useExisting: NdwuRowDefDirective,
  }],
})
export class NdwuRowDefDirective<T> extends CdkRowDef<T> {
  // `columns` and `when` are inherited CDK members, read by the CDK's own
  // `ngOnChanges`. A signal input would declare new fields instead of overriding
  // them, so these bindings keep the decorator API. See `ndwu-column-def`.
  @Input('ndwuRowDefColumns') public override columns: Iterable<string> = [];
  // Undefined means "always", which is what the CDK's own default is.
  @Input('ndwuRowDefWhen') public override when: (index: number, rowData: T) => boolean =
    undefined as unknown as (index: number, rowData: T) => boolean;
}
