import {Directive} from '@angular/core';
import {CdkHeaderCellDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuHeaderCellDef]',
  providers: [{
    provide: CdkHeaderCellDef,
    useExisting: NdwuHeaderCellDefDirective,
  }],
})
export class NdwuHeaderCellDefDirective extends CdkHeaderCellDef {}
