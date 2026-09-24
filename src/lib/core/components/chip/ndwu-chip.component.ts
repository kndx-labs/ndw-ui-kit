import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  isDevMode,
  signal,
  viewChild,
} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {SIZE, type Values} from '../../../shared.types';
import {IconName} from '../../../icon-names';
import {NdwuSizeDirective} from '../../directives';
import {NDWU_SIZE_TOKEN} from '../../tokens';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NdwuSpokesLoaderComponent} from '../spokes-loader/ndwu-spokes-loader.component';
import {toChipSize} from './ndwu-chip.helpers';

export const CHIP_STATUS = {
  DEFAULT: 'default',
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
} as const;

export type NdwuChipStatus = Values<typeof CHIP_STATUS>;

const LOADER_PARAMS = {
  [SIZE.L]: {size: 17, spokeWidth: 1.54, spokeHeight: 4.04, spokeOffset: 0.5},
  [SIZE.XL]: {size: 20, spokeWidth: 1.6, spokeHeight: 4.6, spokeOffset: 0.5},
} as const;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwu-chip],button[ndwuChip]',
  templateUrl: './ndwu-chip.component.html',
  styleUrl: './ndwu-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuIconComponent,
    NdwuSpokesLoaderComponent,
  ],
  host: {
    'type': 'button',
    '[class]': 'hostClasses()',
    '[disabled]': 'disabled() || loading()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-label]': 'ariaLabel()',
    '[style.max-width]': 'maxWidth()',
  },
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  providers: [
    {
      provide: NDWU_SIZE_TOKEN,
      useFactory: (sizeDirective: NdwuSizeDirective) => {
        return () => toChipSize(sizeDirective.effectiveSize());
      },
      deps: [NdwuSizeDirective],
    },
  ],
})
export class NdwuChipComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly status = input<NdwuChipStatus>(CHIP_STATUS.DEFAULT);
  public readonly icon = input<IconName | null>(null);
  public readonly label = input<string>('');
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly loading = input(false, {transform: booleanAttribute});
  public readonly ariaLabel = input<string | null>(null);
  public readonly maxWidth = input<string | null>(null);

  private readonly labelSlot = viewChild.required<ElementRef<HTMLElement>>('labelSlot');

  private readonly hasSlotContent = signal(false);

  constructor() {
    afterNextRender(() => {
      const slotText = Boolean(this.labelSlot().nativeElement.textContent?.trim());

      this.hasSlotContent.set(slotText);

      if (isDevMode() && !slotText && !this.ariaLabel()) {
        console.warn(
          '[ndwu-chip] An icon-only chip has no accessible name. Provide [ariaLabel] with a descriptive name.',
        );
      }
    });
  }

  protected readonly effectiveSize = computed(() => toChipSize(this.sizeSvc.effectiveSize()));

  protected readonly loaderParams = computed(() => LOADER_PARAMS[this.effectiveSize()]);

  protected readonly hostClasses = computed(() => {
    const classes = [
      'ndwu-chip',
      `ndwu-chip--status-${this.status()}`,
      `ndwu-chip--size-${this.effectiveSize()}`,
    ];

    const withIcon = Boolean(this.icon()) || this.loading();

    if (withIcon) {
      classes.push('ndwu-chip--with-icon');
    }

    if (withIcon && !this.label() && !this.hasSlotContent()) {
      classes.push('ndwu-chip--icon-only');
    }

    if (this.loading()) {
      classes.push('ndwu-chip--loading');
    }

    if (this.disabled()) {
      classes.push('ndwu-chip--disabled');
    }

    return classes.join(' ');
  });
}
