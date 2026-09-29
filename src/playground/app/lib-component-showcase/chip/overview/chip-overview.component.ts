import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  NDWU_CHIP_STATUS,
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuChipComponent,
  type NdwuChipStatus,
  type NdwuIconName,
  type NdwuSize,
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
  protected readonly ICON_NAME = NDWU_ICON_NAME;
  protected readonly CHIP_STATUS = NDWU_CHIP_STATUS;

  protected readonly statuses: NdwuChipStatus[] = [
    NDWU_CHIP_STATUS.DEFAULT,
    NDWU_CHIP_STATUS.POSITIVE,
    NDWU_CHIP_STATUS.NEGATIVE,
  ];

  protected readonly sizes: NdwuSize[] = [NDWU_SIZE.L, NDWU_SIZE.XL];

  protected readonly statusIcon: Record<NdwuChipStatus, NdwuIconName> = {
    [NDWU_CHIP_STATUS.DEFAULT]: NDWU_ICON_NAME.DOWNLOAD_S,
    [NDWU_CHIP_STATUS.POSITIVE]: NDWU_ICON_NAME.CHECK_S,
    [NDWU_CHIP_STATUS.NEGATIVE]: NDWU_ICON_NAME.CLOSE_S,
  };
}
