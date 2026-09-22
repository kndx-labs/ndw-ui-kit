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

  // The name has to reach `CdkColumnDef.name`, whose setter derives the cell css
  // classes and the sticky state. A signal input declares a field of its own, so
  // the value is written through to the inherited accessor here. `ngOnChanges`
  // runs before the table caches its column defs, so the name is set in time.
  public ngOnChanges(): void {
    this.name = this.ndwuColumnDef();
  }
}
