import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ICON_NAME, NdwuBadgeComponent, type NdwuBadgeTone, SIZE, type Size} from '@ndw-ui-kit/core';
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
  protected readonly ICON_NAME = ICON_NAME;

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

  protected readonly sizes: Size[] = [SIZE.S, SIZE.L, SIZE.XL];
}
