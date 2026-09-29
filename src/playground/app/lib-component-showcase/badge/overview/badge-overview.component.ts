import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NDWU_ICON_NAME, NDWU_SIZE, NdwuBadgeComponent, type NdwuBadgeTone, type NdwuSize} from '@ndw-ui-kit/core';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-badge-overview',
  templateUrl: './badge-overview.component.html',
  styleUrl: './badge-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuBadgeComponent,
    ShowcaseLayoutComponent,
  ],
})
export class BadgeOverviewComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  protected readonly tones: NdwuBadgeTone[] = [
    'gray',
    'negative',
    'positive',
    'warning',
    'blue',
    'violet',
    'cyan',
    'white',
  ];

  protected readonly sizes: NdwuSize[] = [NDWU_SIZE.S, NDWU_SIZE.L, NDWU_SIZE.XL];
}
