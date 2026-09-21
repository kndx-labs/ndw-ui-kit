import {Component, ChangeDetectionStrategy} from '@angular/core';
import {CdkRow, CDK_ROW_TEMPLATE, CdkCellOutlet} from '@angular/cdk/table';

@Component({
  selector: 'ndwu-row, tr[ndwu-row]',
  template: CDK_ROW_TEMPLATE,
  // The CDK creates rows imperatively and marks them itself; OnPush would keep
  // cell outlets from refreshing when the table re-renders a row.
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{provide: CdkRow, useExisting: NdwuRowComponent}],
  imports: [CdkCellOutlet],
  host: {
    class: 'ndwu-row',
    role: 'row',
  },
})
export class NdwuRowComponent extends CdkRow {}
