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
  // `columns` and `sticky` are inherited CDK members, read by the CDK's own
  // `ngOnChanges`. A signal input would declare new fields instead of overriding
  // them, so these bindings keep the decorator API. See `ndwu-column-def`.
  @Input('ndwuFooterRowDef') public override columns: Iterable<string> = [];

  @Input({alias: 'ndwuFooterRowDefSticky', transform: booleanAttribute})
  public override get sticky(): boolean {
    return super.sticky;
  }

  public override set sticky(value: boolean) {
    super.sticky = value;
  }
}
