import {Directive, OnChanges, input} from '@angular/core';
import {CdkColumnDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuColumnDef]',
  providers: [{
    provide: CdkColumnDef,
    useExisting: NdwuColumnDefDirective,
  }],
})
export class NdwuColumnDefDirective extends CdkColumnDef implements OnChanges {
  public readonly ndwuColumnDef = input.required<string>();

  // Written through to the inherited `CdkColumnDef.name`. `ngOnChanges`, because the
  // table reads defs before its first render and again on every change.
  public ngOnChanges(): void {
    this.name = this.ndwuColumnDef();
  }
}
