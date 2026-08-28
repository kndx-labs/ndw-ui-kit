import {Component, booleanAttribute, input} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

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
    LocalizePipe,
  ],
})
export class NdwuFloatingLabelComponent {
  public readonly label = input<string>('');
  public readonly required = input(false, {transform: booleanAttribute});
}
