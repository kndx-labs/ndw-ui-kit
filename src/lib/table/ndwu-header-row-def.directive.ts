import {Directive, OnChanges, booleanAttribute, input} from '@angular/core';
import {CdkHeaderRowDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuHeaderRowDef]',
  providers: [{
    provide: CdkHeaderRowDef,
    useExisting: NdwuHeaderRowDefDirective,
  }],
})
export class NdwuHeaderRowDefDirective extends CdkHeaderRowDef implements OnChanges {
  public readonly ndwuHeaderRowDef = input<Iterable<string>>([]);

  public readonly ndwuHeaderRowDefSticky = input(false, {transform: booleanAttribute});

  constructor() {
    super();

    super.ngOnChanges({});
  }

  public override ngOnChanges(): void {
    this.columns = this.ndwuHeaderRowDef();
    this.sticky = this.ndwuHeaderRowDefSticky();
  }
}
