import {Directive, computed, input} from '@angular/core';
import {SIZE, type Size} from '../../../../shared.types';
import {BUTTON_VARIANT, type ButtonVariant} from '../../index';

// Simplified version of NdwuButtonComponent with faster initial render.
// Does not support built-in label or icon;
// Does not have `disabled` or `loading` states;
@Directive({
  selector: 'button[ndwuButtonBase]',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class NdwuButtonBaseDirective {
  public readonly variant = input<ButtonVariant>(BUTTON_VARIANT.PRIMARY);
  public readonly size = input<Size>(SIZE.XL);

  protected readonly hostClasses = computed(() => {
    return `ndwu-button-style ndwu-button-style--${this.variant()} ndwu-button-style--${this.size()}`;
  });
}
