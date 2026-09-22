// Superseded by the signal-input version in the file without the `archive_` prefix.
// Kept for reference only: it is not exported and no component imports it.
import {Directive, Input} from '@angular/core';
import {CdkColumnDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuColumnDef]',
  providers: [{
    provide: CdkColumnDef,
    useExisting: ArchiveNdwuColumnDefDirective,
  }],
})
export class ArchiveNdwuColumnDefDirective extends CdkColumnDef {
  // The directive only renames the CDK binding: `ndwuColumnDef` has to end up in
  // `CdkColumnDef.name`, whose setter derives the cell css classes and the sticky
  // state. A signal input cannot do that — `input()` declares a new field instead
  // of overriding the inherited accessor, so the CDK's setter would never run and
  // the column would render without its classes. The decorator therefore stays,
  // placed on an override of the accessor so the alias reaches the base setter.
  @Input('ndwuColumnDef')
  public override get name(): string {
    return super.name;
  }

  public override set name(value: string) {
    super.name = value;
  }
}
