import {
  ChangeDetectionStrategy,
  Component,
  type Signal,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {UiKitTranslationService} from '@ndw-ui-kit/core/l10n';
import {SIZE, type Size, type Values} from '../../../shared.types';
import {IconName} from '../../../icon-names';
import {NdwuSizeDirective} from '../../directives';
import {NDWU_SIZE_TOKEN} from '../../tokens';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NdwuSpokesLoaderComponent} from '../spokes-loader/ndwu-spokes-loader.component';

export const CHIP_STATUS = {
  DEFAULT: 'default',
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
} as const;

export type NdwuChipStatus = Values<typeof CHIP_STATUS>;

/** Chip renders at two sizes only; every other inherited size collapses to one of them. */
type ChipSize = Extract<Size, 'L' | 'XL'>;

const LOADER_SIZE = 20;

/** Labels longer than this are cut down and suffixed with an ellipsis. */
const LABEL_MAX_LENGTH = 18;

const ELLIPSIS = '\u2026';

const ACTIVATION_KEYS = ['Enter', ' '];

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwu-chip],button[ndwuChip]',
  templateUrl: './ndwu-chip.component.html',
  styleUrl: './ndwu-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuIconComponent,
    NdwuSpokesLoaderComponent,
  ],
  host: {
    'type': 'button',
    '[class]': 'hostClasses()',
    '[disabled]': 'disabled()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'loading() || null',
    '[attr.aria-label]': 'effectiveAriaLabel()',
    '[style.max-width]': 'maxWidth()',
    '(keydown)': 'onKeydown($event)',
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
export class NdwuChipComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  private readonly translationSvc = inject(UiKitTranslationService);

  public readonly status = input<NdwuChipStatus>(CHIP_STATUS.DEFAULT);
  public readonly icon = input<IconName | null>(null);
  public readonly label = input<string>('');
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly loading = input(false, {transform: booleanAttribute});
  public readonly ariaLabel = input<string | null>(null);
  public readonly maxWidth = input<string | null>(null);

  protected readonly loaderSize = LOADER_SIZE;

  private hasWarnedMissingAccessibleName = false;

  /** Re-runs label localization when the active language changes. */
  private readonly langChange: Signal<unknown>;

  constructor() {
    this.langChange = toSignal(this.translationSvc.onLangChange$, {initialValue: null});

    // An icon-only chip projects no text, so `ariaLabel` is its only accessible name.
    effect(() => {
      if (!isDevMode() || this.hasWarnedMissingAccessibleName) {
        return;
      }

      if (this.label() || this.ariaLabel()) {
        return;
      }

      this.hasWarnedMissingAccessibleName = true;

      console.warn(
        '[ndwu-chip] An icon-only chip has no accessible name. Provide [ariaLabel] with a descriptive name.',
      );
    });
  }

  protected readonly localizedLabel = computed(() => {
    this.langChange();

    const label = this.label();

    return label ? this.translationSvc.instant(label) : '';
  });

  /** Visible text: cut to LABEL_MAX_LENGTH characters, the full text stays in aria-label and title. */
  protected readonly displayLabel = computed(() => {
    const label = this.localizedLabel();

    return label.length > LABEL_MAX_LENGTH
      ? `${label.slice(0, LABEL_MAX_LENGTH)}${ELLIPSIS}`
      : label;
  });

  protected readonly isLabelTruncated = computed(() => this.displayLabel() !== this.localizedLabel());

  protected readonly effectiveAriaLabel = computed(() => {
    const ariaLabel = this.ariaLabel();

    if (ariaLabel) {
      return ariaLabel;
    }

    // A truncated label would otherwise reach assistive tech cut off mid-word.
    return this.isLabelTruncated() ? this.localizedLabel() : null;
  });

  protected readonly effectiveSize = computed<ChipSize>(() => {
    const size = this.sizeSvc.effectiveSize();

    return size === SIZE.XL || size === SIZE.XXL ? SIZE.XL : SIZE.L;
  });

  protected readonly hostClasses = computed(() => {
    const classes = [
      'ndwu-chip',
      `ndwu-chip--status-${this.status()}`,
      `ndwu-chip--size-${this.effectiveSize()}`,
    ];

    if (this.icon() || this.loading()) {
      classes.push('ndwu-chip--with-icon');
    }

    if (!this.label()) {
      classes.push('ndwu-chip--icon-only');
    }

    if (this.loading()) {
      classes.push('ndwu-chip--loading');
    }

    return classes.join(' ');
  });

  /** A loading chip stays focusable, but must not fire its action again. */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.loading() && ACTIVATION_KEYS.includes(event.key)) {
      event.preventDefault();
    }
  }
}
