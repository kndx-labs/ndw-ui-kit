import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {NDWU_NOTIFICATION_VARIANT, NdwuNotificationComponent} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

interface NotificationVariantData {
  id: string;
  variant: (typeof NDWU_NOTIFICATION_VARIANT)[keyof typeof NDWU_NOTIFICATION_VARIANT];
}

const NOTIFICATION_VARIANTS: readonly NotificationVariantData[] = [
  {id: 'info', variant: NDWU_NOTIFICATION_VARIANT.INFO},
  {id: 'success', variant: NDWU_NOTIFICATION_VARIANT.SUCCESS},
  {id: 'warning', variant: NDWU_NOTIFICATION_VARIANT.WARNING},
  {id: 'error', variant: NDWU_NOTIFICATION_VARIANT.ERROR},
];

@Component({
  selector: 'app-notification-overview',
  templateUrl: './notification-overview.component.html',
  styleUrl: './notification-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NdwuNotificationComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class NotificationOverviewComponent {
  public readonly VARIANTS = NOTIFICATION_VARIANTS;
  public readonly NOTIFICATION_VARIANT = NDWU_NOTIFICATION_VARIANT;
}
