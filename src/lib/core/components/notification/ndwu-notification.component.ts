import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {LocalizeHtmlPipe, type NdwuLocalizableHtml} from '@ndw-ui-kit/core/l10n';
import {NDWU_ICON_NAME, NdwuIconName} from '../../../icon-names';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NdwuValues} from '../../../shared.types';

export const NDWU_NOTIFICATION_VARIANT = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type NdwuNotificationVariant = NdwuValues<typeof NDWU_NOTIFICATION_VARIANT>;

@Component({
  selector: 'ndwu-notification',
  templateUrl: './ndwu-notification.component.html',
  styleUrl: './ndwu-notification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent, LocalizeHtmlPipe],
})
export class NdwuNotificationComponent {
  public readonly variant = input<NdwuNotificationVariant>(NDWU_NOTIFICATION_VARIANT.INFO);
  public readonly message = input<NdwuLocalizableHtml>('');

  protected readonly ICON_NAME = NDWU_ICON_NAME;

  protected readonly hostClasses = computed(() => {
    return [
      'ndwu-notification',
      `ndwu-notification--${this.variant()}`,
    ];
  });

  protected readonly variantIcon = computed<NdwuIconName>(() => {
    switch (this.variant()) {
      case NDWU_NOTIFICATION_VARIANT.SUCCESS:
        return NDWU_ICON_NAME.SUCCESS_S;
      case NDWU_NOTIFICATION_VARIANT.WARNING:
        return NDWU_ICON_NAME.WARNING_S;
      case NDWU_NOTIFICATION_VARIANT.ERROR:
        return NDWU_ICON_NAME.ERROR_S;
      case NDWU_NOTIFICATION_VARIANT.INFO:
      default:
        return NDWU_ICON_NAME.INFO_S;
    }
  });
}
