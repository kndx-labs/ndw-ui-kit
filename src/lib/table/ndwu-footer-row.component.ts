import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CDK_ROW_TEMPLATE, CdkCellOutlet, CdkFooterRow} from '@angular/cdk/table';

@Component({
  selector: 'ndwu-footer-row, tr[ndwu-footer-row]',
  template: CDK_ROW_TEMPLATE,
  // Not OnPush: the CDK renders rows imperatively, and OnPush blocks their cells.
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{
    provide: CdkFooterRow,
    useExisting: NdwuFooterRowComponent,
  }],
  imports: [CdkCellOutlet],
  host: {
    class: 'ndwu-footer-row',
    role: 'row',
  },
})
export class NdwuFooterRowComponent extends CdkFooterRow {}
