import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CDK_ROW_TEMPLATE, CdkCellOutlet, CdkHeaderRow} from '@angular/cdk/table';

@Component({
  selector: 'ndwu-header-row, tr[ndwu-header-row]',
  template: CDK_ROW_TEMPLATE,
  // Not OnPush: the CDK renders rows imperatively, and OnPush blocks their cells.
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{
    provide: CdkHeaderRow,
    useExisting: NdwuHeaderRowComponent,
  }],
  imports: [CdkCellOutlet],
  host: {
    class: 'ndwu-header-row',
    role: 'row',
  },
})
export class NdwuHeaderRowComponent extends CdkHeaderRow {}
