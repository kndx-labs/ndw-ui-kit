import {Component, ChangeDetectionStrategy} from '@angular/core';
import {CdkHeaderRow, CDK_ROW_TEMPLATE, CdkCellOutlet} from '@angular/cdk/table';

@Component({
  selector: 'ndwu-header-row, tr[ndwu-header-row]',
  template: CDK_ROW_TEMPLATE,
  // The CDK creates rows imperatively and marks them itself; OnPush would keep
  // cell outlets from refreshing when the table re-renders a row.
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{provide: CdkHeaderRow, useExisting: NdwuHeaderRowComponent}],
  imports: [CdkCellOutlet],
  host: {
    class: 'ndwu-header-row',
    role: 'row',
  },
})
export class NdwuHeaderRowComponent extends CdkHeaderRow {}
