import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {NdwuSizeDirective} from '../../directives';
import {NDWU_SIZE_TOKEN} from '../../tokens';

@Component({
  selector: 'ndwu-form-container',
  templateUrl: './ndwu-form-container.component.html',
  styleUrl: './ndwu-form-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
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
})
export class NdwuFormContainerComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  protected readonly rootClass = computed(() => {
    return `ndwu-form-container ndwu-form-container--${this.sizeSvc.effectiveSize()}`;
  });
}
