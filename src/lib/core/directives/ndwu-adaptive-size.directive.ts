import {Directive, computed, input} from '@angular/core';
import {NdwuSizeFlags, resolveSizeFlags} from '@ndw-ui-kit/core/utils';
import {NDWU_SIZE, NdwuSize} from '../../shared.types';

const SIZE_PRIORITY: readonly NdwuSize[] = [NDWU_SIZE.XXL, NDWU_SIZE.XL, NDWU_SIZE.L, NDWU_SIZE.S];

@Directive({
  selector: '[ndwuAdaptiveSize]',
  standalone: true,
})
export class NdwuAdaptiveSizeDirective {
  public readonly sizeFlags = input<NdwuSizeFlags | undefined>(undefined, {alias: 'ndwuAdaptiveSize'});

  public readonly adaptiveSize = computed(() => resolveSizeFlags(this.sizeFlags(), SIZE_PRIORITY));
}
