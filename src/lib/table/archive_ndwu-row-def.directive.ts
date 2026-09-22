// Superseded by the signal-input version in the file without the `archive_` prefix.
// Kept for reference only: it is not exported and no component imports it.
import {Directive, Input} from '@angular/core';
import {CdkRowDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuRowDef]',
  providers: [{
    provide: CdkRowDef,
    useExisting: ArchiveNdwuRowDefDirective,
  }],
})
export class ArchiveNdwuRowDefDirective<T> extends CdkRowDef<T> {
  // `columns` and `when` are inherited CDK members, read by the CDK's own
  // `ngOnChanges`. A signal input would declare new fields instead of overriding
  // them, so these bindings keep the decorator API. See `ndwu-column-def`.
  @Input('ndwuRowDefColumns') public override columns: Iterable<string> = [];
  // Undefined means "always", which is what the CDK's own default is.
  @Input('ndwuRowDefWhen') public override when: (index: number, rowData: T) => boolean =
    undefined as unknown as (index: number, rowData: T) => boolean;
}
