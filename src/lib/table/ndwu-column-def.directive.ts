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
  // the value is written through to the inherited accessor here.
  //
  // The table reads its defs in its own `ngAfterContentChecked`, on every render.
  // `ngOnChanges` is the only hook that is both early enough and tied to the value:
  // - `ngAfterViewInit` runs after that first render, when no def has a name yet,
  //   so the table fails with "Duplicate column definition name: undefined".
  // - `ngOnInit` sets the first value in time but never runs again, so a binding
  //   that later changes would leave the CDK member stale.
  // - `ngOnChanges` runs ahead of the render whenever the bound value changes, and
  //   only then, not on each change detection pass. Every run is one that is
  //   needed, and the write is idempotent.
  public ngOnChanges(): void {
    this.name = this.ndwuColumnDef();
  }
}
