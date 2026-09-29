import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {NDWU_SIZE, type NdwuSize} from '../../../shared.types';
import {NdwuIconName} from '../../../icon-names';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NDWU_SIZE_TOKEN} from '../../tokens';
import {NdwuSizeDirective} from '../../directives';

export type NdwuBadgeTone =
  | 'gray'
  | 'negative'
  | 'positive'
  | 'warning'
  | 'blue'
  | 'violet'
  | 'cyan'
  | 'white';

const SIZES_WITH_ICON: NdwuSize[] = [NDWU_SIZE.XL, NDWU_SIZE.L];

@Component({
  selector: 'ndwu-badge',
  templateUrl: './ndwu-badge.component.html',
  styleUrl: './ndwu-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent],
  host: {
    '[class]': 'hostClass()',
    '[style.max-width]': 'maxWidth()',
    '[attr.aria-label]': 'ariaLabel()',
  },
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
export class NdwuBadgeComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly tone = input<NdwuBadgeTone>('gray');
  public readonly icon = input<NdwuIconName | null>(null);
  public readonly ariaLabel = input<string | null>(null);
  public readonly maxWidth = input<string | null>(null);
  public readonly disabled = input(false);

  protected readonly hostClass = computed(() => {
    const classes = [
      'ndwu-badge',
      `ndwu-badge--tone-${this.tone()}`,
      `ndwu-badge--size-${this.sizeSvc.effectiveSize()}`,
    ];

    if (this.disabled()) {
      classes.push('ndwu-badge--disabled');
    }

    return classes.join(' ');
  });

  protected readonly effectiveIcon = computed(() => {
    return SIZES_WITH_ICON.includes(this.sizeSvc.effectiveSize())
      ? this.icon()
      : null;
  });
}
