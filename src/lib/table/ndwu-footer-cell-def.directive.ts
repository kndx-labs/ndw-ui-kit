import {Directive} from '@angular/core';
import {CdkFooterCellDef} from '@angular/cdk/table';

@Directive({
  selector: '[ndwuFooterCellDef]',
  providers: [{
    provide: CdkFooterCellDef,
    useExisting: NdwuFooterCellDefDirective,
  }],
})
export class NdwuFooterCellDefDirective extends CdkFooterCellDef {}
