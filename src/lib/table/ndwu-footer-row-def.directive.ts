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

    super.ngOnChanges({});
  }

  public override ngOnChanges(): void {
    this.columns = this.ndwuFooterRowDef();
    this.sticky = this.ndwuFooterRowDefSticky();
  }
}
