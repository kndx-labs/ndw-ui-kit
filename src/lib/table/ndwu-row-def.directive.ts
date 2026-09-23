import {Directive, OnChanges, input} from '@angular/core';
import {CdkRowDef} from '@angular/cdk/table';

type RowPredicate<T> = (index: number, rowData: T) => boolean;

@Directive({
  selector: '[ndwuRowDef]',
  providers: [{
    provide: CdkRowDef,
    useExisting: NdwuRowDefDirective,
  }],
})
export class NdwuRowDefDirective<T> extends CdkRowDef<T> implements OnChanges {
  public readonly ndwuRowDefColumns = input<Iterable<string>>([]);

  /** Undefined means "always", which is what the CDK's own default is. */
  public readonly ndwuRowDefWhen = input<RowPredicate<T>>(undefined as unknown as RowPredicate<T>);

  constructor() {
    super();

    // The CDK builds its columns differ from the `columns` key of a decorator
    // driven `ngOnChanges`. A signal input reports its own key instead, so the
    // differ is primed here with an empty set and fed by `getColumnsDiff`.
    super.ngOnChanges({});
  }

  // `columns` and `when` are inherited CDK members read by the table itself, so
  // the signal values are written through to them. `ngOnChanges` rather than a
  // once-only hook, because swapping the bound column list, to hide or reorder
  // columns, must reach the CDK too. See `ndwu-column-def`.
  public override ngOnChanges(): void {
    this.columns = this.ndwuRowDefColumns();
    this.when = this.ndwuRowDefWhen();
  }
}
