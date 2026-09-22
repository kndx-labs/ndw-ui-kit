// Superseded by the signal-input version in the file without the `archive_` prefix.
// Kept for reference only: it is not exported and no component imports it.
import {Directive, Input, booleanAttribute} from '@angular/core';
import {CdkFooterRowDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuFooterRowDef]',
  providers: [{
    provide: CdkFooterRowDef,
    useExisting: ArchiveNdwuFooterRowDefDirective,
  }],
})
export class ArchiveNdwuFooterRowDefDirective extends CdkFooterRowDef {
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
