import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {NdwuSizeDirective} from '../../directives';
import {NDWU_SIZE_TOKEN} from '../../tokens';
import {NDWU_SIZE} from '../../../shared.types';

@Component({
  selector: 'ndwu-card',
  templateUrl: './ndwu-card.component.html',
  styleUrl: './ndwu-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  providers: [
    {
      provide: NDWU_SIZE_TOKEN,
      useFactory: (sizeDirective: NdwuSizeDirective) => {
        return () => sizeDirective.effectiveSize();
      },
      deps: [NdwuSizeDirective],
    },
  ],
  host: {
    '[class]': 'rootClass()',
  },
})
export class NdwuCardComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  protected readonly rootClass = computed(() => {
    const size = this.sizeSvc.effectiveSize();
    const cardSize = size === NDWU_SIZE.S ? 'L' : size;

    return `ndwu-card ndwu-card--${cardSize}`;
  });
}
