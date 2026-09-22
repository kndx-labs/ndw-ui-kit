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
  // `columns` and `sticky` are inherited CDK members, read by the CDK's own
  // `ngOnChanges`. A signal input would declare new fields instead of overriding
  // them, so these bindings keep the decorator API. See `ndwu-column-def`.
  @Input('ndwuHeaderRowDef') public override columns: Iterable<string> = [];

  @Input({alias: 'ndwuHeaderRowDefSticky', transform: booleanAttribute})
  public override get sticky(): boolean {
    return super.sticky;
  }

  public override set sticky(value: boolean) {
    super.sticky = value;
  }
}
