import {Directive, computed, inject, input} from '@angular/core';
import {NDWU_SIZE, NdwuSize} from '../../shared.types';
import {NDWU_SIZE_TOKEN} from '../tokens';

@Directive({
  selector: '[ndwuSize]',
  standalone: true,
})
export class NdwuSizeDirective {
  private parentSize = inject(NDWU_SIZE_TOKEN, {optional: true, skipSelf: true});

  public readonly size = input<NdwuSize | undefined>(undefined, {alias: 'ndwuSize'});

  public readonly effectiveSize = computed(() => {
    return this.size() ?? this.parentSize?.() ?? NDWU_SIZE.XL;
  });
}
