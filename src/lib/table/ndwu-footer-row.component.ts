import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CDK_ROW_TEMPLATE, CdkCellOutlet, CdkFooterRow} from '@angular/cdk/table';

@Component({
  selector: 'ndwu-footer-row, tr[ndwu-footer-row]',
  template: CDK_ROW_TEMPLATE,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- CDK renders rows imperatively; OnPush blocks their cells
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
