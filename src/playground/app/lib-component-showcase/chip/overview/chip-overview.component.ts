import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  CHIP_STATUS,
  ICON_NAME,
  type IconName,
  NdwuChipComponent,
  type NdwuChipStatus,
  SIZE,
  type Size,
} from '@ndw-ui-kit/core';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-chip-overview',
  templateUrl: './chip-overview.component.html',
  styleUrl: './chip-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuChipComponent,
    ShowcaseLayoutComponent,
  ],
})
export class ChipOverviewComponent {
  protected readonly ICON_NAME = ICON_NAME;
  protected readonly CHIP_STATUS = CHIP_STATUS;

  protected readonly statuses: NdwuChipStatus[] = [
    CHIP_STATUS.DEFAULT,
    CHIP_STATUS.POSITIVE,
    CHIP_STATUS.NEGATIVE,
  ];

  protected readonly sizes: Size[] = [SIZE.L, SIZE.XL];

  protected readonly statusIcon: Record<NdwuChipStatus, IconName> = {
    [CHIP_STATUS.DEFAULT]: ICON_NAME.DOWNLOAD_S,
    [CHIP_STATUS.POSITIVE]: ICON_NAME.CHECK_S,
    [CHIP_STATUS.NEGATIVE]: ICON_NAME.CLOSE_S,
  };
}
