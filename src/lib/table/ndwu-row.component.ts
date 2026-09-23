import {Component, ChangeDetectionStrategy} from '@angular/core';
import {CdkRow, CDK_ROW_TEMPLATE, CdkCellOutlet} from '@angular/cdk/table';

@Component({
  selector: 'ndwu-row, tr[ndwu-row]',
  template: CDK_ROW_TEMPLATE,
  // Not OnPush: the CDK renders rows imperatively, and OnPush blocks their cells.
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{
    provide: CdkRow,
    useExisting: NdwuRowComponent,
  }],
  imports: [CdkCellOutlet],
  host: {
    class: 'ndwu-row',
    role: 'row',
  },
})
export class NdwuRowComponent extends CdkRow {}
