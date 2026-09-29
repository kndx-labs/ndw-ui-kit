import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {ValidationErrors} from '@angular/forms';
import {NDWU_ICON_NAME, type NdwuHelperMessageStatus, NdwuIconComponent} from '@ndw-ui-kit/core';
import {escapeHtml} from '@ndw-ui-kit/core/utils';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

@Component({
  selector: 'ndwu-helper-message',
  templateUrl: './ndwu-helper-message.component.html',
  styleUrls: ['./ndwu-helper-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuIconComponent,
  ],
})
export class NdwuHelperMessageComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  public readonly errorMessage = input<string>('');
  public readonly helperMessage = input<string>('');
  public readonly validationData = input<ValidationErrors>();
  public readonly status = input<NdwuHelperMessageStatus>('default');

  protected readonly sanitizedValidationData = computed((): ValidationErrors => {
    const data = this.validationData() ?? {};
    const result: ValidationErrors = {};

    for (const [key, value] of Object.entries(data) as [string, unknown][]) {
      result[key] = escapeHtml(String(value));
    }

    return result;
  });
}
