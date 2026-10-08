import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CDK_ROW_TEMPLATE, CdkCellOutlet, CdkRow} from '@angular/cdk/table';

@Component({
  selector: 'ndwu-row, tr[ndwu-row]',
  template: CDK_ROW_TEMPLATE,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- CDK renders rows imperatively; OnPush blocks their cells
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
