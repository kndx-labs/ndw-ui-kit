import {Directive, Input, booleanAttribute} from '@angular/core';
import {CdkHeaderRowDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuHeaderRowDef]',
  providers: [{
    provide: CdkHeaderRowDef,
    useExisting: NdwuHeaderRowDefDirective,
  }],
})
export class NdwuHeaderRowDefDirective extends CdkHeaderRowDef {
  // `columns` and `sticky` come from the CDK base class, so they keep the
  // decorator API: a signal input cannot override an inherited member.
  @Input('ndwuHeaderRowDef') public override columns: Iterable<string> = [];

  @Input({alias: 'ndwuHeaderRowDefSticky', transform: booleanAttribute})
  public override get sticky(): boolean {
    return super.sticky;
  }

  public override set sticky(value: boolean) {
    super.sticky = value;
  }
}
