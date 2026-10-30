import {ChangeDetectionStrategy, Component, booleanAttribute, input} from '@angular/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';

@Component({
  selector: 'ndwu-floating-label',
  standalone: true,
  template: `
    {{ label() | localize}}
    @if (required()) {
      <span class="ndwu-label__required-asterisk">*</span>
    }
  `,
  imports: [
    NdwuLocalizePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NdwuFloatingLabelComponent {
  public readonly label = input<string>('');
  public readonly required = input(false, {transform: booleanAttribute});
}
