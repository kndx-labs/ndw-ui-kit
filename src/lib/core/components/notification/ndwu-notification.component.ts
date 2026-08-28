import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ICON_NAME, IconName} from '../../../icon-names';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {Values} from '../../../shared.types';

export const NOTIFICATION_VARIANT = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type NotificationVariant = Values<typeof NOTIFICATION_VARIANT>;

@Component({
  selector: 'ndwu-notification',
  templateUrl: './ndwu-notification.component.html',
  styleUrl: './ndwu-notification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent, LocalizePipe],
})
export class NdwuNotificationComponent {
  public readonly variant = input<NotificationVariant>(NOTIFICATION_VARIANT.INFO);
  public readonly message = input<string>('');

  protected readonly ICON_NAME = ICON_NAME;

  protected readonly hostClasses = computed(() => {
    return [
      'ndwu-notification',
      `ndwu-notification--${this.variant()}`,
    ];
  });

  protected readonly variantIcon = computed<IconName>(() => {
    switch (this.variant()) {
      case NOTIFICATION_VARIANT.SUCCESS:
        return ICON_NAME.SUCCESS_S;
      case NOTIFICATION_VARIANT.WARNING:
        return ICON_NAME.WARNING_S;
      case NOTIFICATION_VARIANT.ERROR:
        return ICON_NAME.ERROR_S;
      case NOTIFICATION_VARIANT.INFO:
      default:
        return ICON_NAME.INFO_S;
    }
  });
}
