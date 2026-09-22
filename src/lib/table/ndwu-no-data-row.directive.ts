import {Directive} from '@angular/core';
import {CdkNoDataRow} from '@angular/cdk/table';

@Directive({
  selector: 'ng-template[ndwuNoDataRow]',
  providers: [{
    provide: CdkNoDataRow,
    useExisting: NdwuNoDataRowDirective,
  }],
})
export class NdwuNoDataRowDirective extends CdkNoDataRow {}
