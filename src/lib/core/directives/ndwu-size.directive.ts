import {Directive, computed, inject, input} from '@angular/core';
import {NdwuSize, SIZE} from '../../shared.types';
import {NDWU_SIZE_TOKEN} from '../tokens';

@Directive({
  selector: '[ndwuSize]',
  standalone: true,
})
export class NdwuSizeDirective {
  private parentSize = inject(NDWU_SIZE_TOKEN, {optional: true, skipSelf: true});

  public readonly size = input<NdwuSize | undefined>(undefined, {alias: 'ndwuSize'});

  public readonly effectiveSize = computed(() => {
    return this.size() ?? this.parentSize?.() ?? SIZE.XL;
  });
}
