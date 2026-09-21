import {Directive, Input} from '@angular/core';
import {CdkColumnDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuColumnDef]',
  providers: [{provide: CdkColumnDef, useExisting: NdwuColumnDefDirective}],
})
export class NdwuColumnDefDirective extends CdkColumnDef {
  // `name` is an accessor on the CDK class (setting it also derives the cell
  // css classes), so the alias has to go on an override of that accessor.
  @Input('ndwuColumnDef')
  public override get name(): string {
    return super.name;
  }

  public override set name(value: string) {
    super.name = value;
  }
}
