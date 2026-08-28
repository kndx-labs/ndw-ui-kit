import {Directive, computed, input} from '@angular/core';
import {NdwuSizeFlags, resolveSizeFlags} from '@ndw-ui-kit/core/utils';
import {SIZE, Size} from '../../shared.types';

const SIZE_PRIORITY: readonly Size[] = [SIZE.XXL, SIZE.XL, SIZE.L, SIZE.S];

@Directive({
  selector: '[ndwuAdaptiveSize]',
  standalone: true,
})
export class NdwuAdaptiveSizeDirective {
  public readonly sizeFlags = input<NdwuSizeFlags | undefined>(undefined, {alias: 'ndwuAdaptiveSize'});

  public readonly adaptiveSize = computed(() => resolveSizeFlags(this.sizeFlags(), SIZE_PRIORITY));
}
