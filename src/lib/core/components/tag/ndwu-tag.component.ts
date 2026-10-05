import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NDWU_ICON_NAME, NdwuIconName} from '../../../icon-names';
import {type NdwuValues} from '../../../shared.types';
import {NdwuSizeDirective} from '../../directives';
import {NDWU_SIZE_TOKEN} from '../../tokens';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {ndwuToTagSize} from './ndwu-tag.helpers';

export const NDWU_TAG_STATUS = {
  DEFAULT: 'default',
  NEGATIVE: 'negative',
  POSITIVE: 'positive',
  WARNING: 'warning',
  INFO: 'info',
  VIOLET: 'violet',
  CYAN: 'cyan',
} as const;

export type NdwuTagStatus = NdwuValues<typeof NDWU_TAG_STATUS>;

export const NDWU_TAG_LABEL_MAX_LENGTH = 18;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwu-tag],button[ndwuTag]',
  templateUrl: './ndwu-tag.component.html',
  styleUrl: './ndwu-tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuIconComponent,
  ],
  host: {
    'type': 'button',
    '[class]': 'hostClasses()',
    '[disabled]': 'disabled()',
    '[attr.aria-pressed]': 'selected()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-keyshortcuts]': 'removable() ? "Delete Backspace" : null',
    '[style.max-width]': 'maxWidth()',
    '(click)': 'toggle()',
    '(keydown.delete)': 'onRemoveKey($event)',
    '(keydown.backspace)': 'onRemoveKey($event)',
  },
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  providers: [
    {
      provide: NDWU_SIZE_TOKEN,
      useFactory: (sizeDirective: NdwuSizeDirective) => {
        return () => ndwuToTagSize(sizeDirective.effectiveSize());
      },
      deps: [NdwuSizeDirective],
    },
  ],
})
export class NdwuTagComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  protected readonly CLOSE_ICON = NDWU_ICON_NAME.CLOSE_XS;
  protected readonly LABEL_MAX_LENGTH = NDWU_TAG_LABEL_MAX_LENGTH;

  public readonly status = input<NdwuTagStatus>(NDWU_TAG_STATUS.DEFAULT);
  public readonly icon = input<NdwuIconName | null>(null);
  public readonly label = input<string>('');
  public readonly selected = model(false);
  public readonly removable = input(false, {transform: booleanAttribute});
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly ariaLabel = input<string | null>(null);
  public readonly maxWidth = input<string | null>(null);

  public readonly removed = output<void>();

  protected readonly effectiveSize = computed(() => ndwuToTagSize(this.sizeSvc.effectiveSize()));

  protected readonly hostClasses = computed(() => {
    const classes = [
      'ndwu-tag',
      `ndwu-tag--status-${this.status()}`,
      `ndwu-tag--size-${this.effectiveSize()}`,
    ];

    if (this.selected()) {
      classes.push('ndwu-tag--selected');
    }

    if (this.disabled()) {
      classes.push('ndwu-tag--disabled');
    }

    return classes.join(' ');
  });

  protected toggle(): void {
    if (!this.disabled()) {
      this.selected.update((selected) => !selected);
    }
  }

  protected onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.disabled()) {
      this.removed.emit();
    }
  }

  protected onRemoveKey(event: Event): void {
    if (this.removable() && !this.disabled()) {
      event.preventDefault();
      this.removed.emit();
    }
  }
}
