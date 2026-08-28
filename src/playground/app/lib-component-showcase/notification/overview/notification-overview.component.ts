import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {NOTIFICATION_VARIANT, NdwuNotificationComponent} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

interface NotificationVariantData {
  id: string;
  variant: (typeof NOTIFICATION_VARIANT)[keyof typeof NOTIFICATION_VARIANT];
}

const NOTIFICATION_VARIANTS: readonly NotificationVariantData[] = [
  {id: 'info', variant: NOTIFICATION_VARIANT.INFO},
  {id: 'success', variant: NOTIFICATION_VARIANT.SUCCESS},
  {id: 'warning', variant: NOTIFICATION_VARIANT.WARNING},
  {id: 'error', variant: NOTIFICATION_VARIANT.ERROR},
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
  public readonly NOTIFICATION_VARIANT = NOTIFICATION_VARIANT;
}
