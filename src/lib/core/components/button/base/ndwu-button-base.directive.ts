import {Directive, computed, input} from '@angular/core';
import {NDWU_SIZE, type NdwuSize} from '../../../../shared.types';
import {NDWU_BUTTON_VARIANT, type NdwuButtonVariant} from '../../index';

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
  public readonly variant = input<NdwuButtonVariant>(NDWU_BUTTON_VARIANT.PRIMARY);
  public readonly size = input<NdwuSize>(NDWU_SIZE.XL);

  protected readonly hostClasses = computed(() => {
    return `ndwu-button-style ndwu-button-style--${this.variant()} ndwu-button-style--${this.size()}`;
  });
}
