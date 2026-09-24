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

  public readonly ndwuRowDefWhen = input<RowPredicate<T>>(undefined as unknown as RowPredicate<T>);

  constructor() {
    super();

    // Primes the CDK columns differ, which a signal input never triggers.
    super.ngOnChanges({});
  }

  public override ngOnChanges(): void {
    this.columns = this.ndwuRowDefColumns();
    this.when = this.ndwuRowDefWhen();
  }
}
