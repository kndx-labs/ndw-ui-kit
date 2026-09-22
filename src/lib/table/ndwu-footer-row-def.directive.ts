import {Directive, Input, booleanAttribute} from '@angular/core';
import {CdkFooterRowDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuFooterRowDef]',
  providers: [{
    provide: CdkFooterRowDef,
    useExisting: NdwuFooterRowDefDirective,
  }],
})
export class NdwuFooterRowDefDirective extends CdkFooterRowDef {
  // `columns` and `sticky` come from the CDK base class, so they keep the
  // decorator API: a signal input cannot override an inherited member.
  @Input('ndwuFooterRowDef') public override columns: Iterable<string> = [];

  @Input({alias: 'ndwuFooterRowDefSticky', transform: booleanAttribute})
  public override get sticky(): boolean {
    return super.sticky;
  }

  public override set sticky(value: boolean) {
    super.sticky = value;
  }
}
