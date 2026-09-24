import {Directive} from '@angular/core';
import {CdkCellDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuCellDef]',
  providers: [{
    provide: CdkCellDef,
    useExisting: NdwuCellDefDirective,
  }],
})
export class NdwuCellDefDirective extends CdkCellDef {}
