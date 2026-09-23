import {Directive, OnChanges, booleanAttribute, input} from '@angular/core';
import {CdkFooterRowDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuFooterRowDef]',
  providers: [{
    provide: CdkFooterRowDef,
    useExisting: NdwuFooterRowDefDirective,
  }],
})
export class NdwuFooterRowDefDirective extends CdkFooterRowDef implements OnChanges {
  public readonly ndwuFooterRowDef = input<Iterable<string>>([]);

  public readonly ndwuFooterRowDefSticky = input(false, {transform: booleanAttribute});

  constructor() {
    super();

    // The CDK builds its columns differ from the `columns` key of a decorator
    // driven `ngOnChanges`. A signal input reports its own key instead, so the
    // differ is primed here with an empty set and fed by `getColumnsDiff`.
    super.ngOnChanges({});
  }

  // `columns` and `sticky` are inherited CDK members read by the table itself, so
  // the signal values are written through to them. `ngOnChanges` rather than a
  // once-only hook, because swapping the bound column list, to hide or reorder
  // columns, must reach the CDK too. See `ndwu-column-def`.
  public override ngOnChanges(): void {
    this.columns = this.ndwuFooterRowDef();
    this.sticky = this.ndwuFooterRowDefSticky();
  }
}
