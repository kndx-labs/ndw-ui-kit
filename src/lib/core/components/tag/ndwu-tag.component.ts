import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
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
import {ndwuToChipSize} from '../chip/ndwu-chip.helpers';

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
    '[attr.aria-pressed]': 'selectable() ? selected() : null',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-keyshortcuts]': 'removable() ? "Delete Backspace" : null',
    '[style.max-width]': 'maxWidth()',
    '[style.--ndwu-tag-label-max-width]': 'maxWidth() ? "none" : null',
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
        return () => ndwuToChipSize(sizeDirective.effectiveSize());
      },
      deps: [NdwuSizeDirective],
    },
  ],
})
export class NdwuTagComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly CLOSE_ICON = NDWU_ICON_NAME.CLOSE_XS;

  public readonly status = input<NdwuTagStatus>(NDWU_TAG_STATUS.DEFAULT);
  public readonly icon = input<NdwuIconName | null>(null);
  public readonly label = input<string>('');
  public readonly selectable = input(false, {transform: booleanAttribute});
  public readonly selected = model(false);
  public readonly removable = input(false, {transform: booleanAttribute});
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly ariaLabel = input<string | null>(null);
  public readonly removeLabel = input<string>('Remove');
  public readonly maxWidth = input<string | null>(null);

  public readonly removed = output<void>();

  private focusAfterRemoval: HTMLElement | null = null;

  protected readonly effectiveSize = computed(() => ndwuToChipSize(this.sizeSvc.effectiveSize()));

  protected readonly hostClasses = computed(() => {
    const classes = [
      'ndwu-tag',
      `ndwu-tag--status-${this.status()}`,
      `ndwu-tag--size-${this.effectiveSize()}`,
    ];

    if (this.selectable() && this.selected()) {
      classes.push('ndwu-tag--selected');
    }

    if (this.disabled()) {
      classes.push('ndwu-tag--disabled');
    }

    return classes.join(' ');
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.restoreFocus());
  }

  protected toggle(): void {
    if (this.selectable()) {
      this.selected.update((selected) => !selected);
    }
  }

  protected onRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    this.remove();
  }

  protected onRemoveKey(event: Event): void {
    if (this.removable()) {
      event.preventDefault();
      this.remove();
    }
  }

  private remove(): void {
    const host = this.elementRef.nativeElement;

    this.focusAfterRemoval = host.ownerDocument.activeElement === host ? this.findSiblingTag(host) : null;
    this.removed.emit();
  }

  private restoreFocus(): void {
    const target = this.focusAfterRemoval;

    if (!target?.isConnected) {
      return;
    }

    const {activeElement, body} = target.ownerDocument;

    if (!activeElement || activeElement === body || activeElement === this.elementRef.nativeElement) {
      target.focus();
    }
  }

  private findSiblingTag(host: HTMLElement): HTMLElement | null {
    for (const direction of ['nextElementSibling', 'previousElementSibling'] as const) {
      let sibling = host[direction];

      while (sibling) {
        if (sibling instanceof HTMLButtonElement && sibling.classList.contains('ndwu-tag') && !sibling.disabled) {
          return sibling;
        }

        sibling = sibling[direction];
      }
    }

    return null;
  }
}
