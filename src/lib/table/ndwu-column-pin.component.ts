import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input, output} from '@angular/core';
import {ICON_NAME, NdwuIconComponent, NdwuSizeDirective} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const DEFAULT_COLUMN_PIN_TEXTS = {
  pin: 'Pin column',
  unpin: 'Unpin column',
};

/** Only reports intent: bind it to the column def's `sticky` to freeze the column. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwuColumnPin]',
  templateUrl: './ndwu-column-pin.component.html',
  styleUrl: './ndwu-column-pin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent, LocalizePipe],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  host: {
    '[class]': 'rootClass()',
    'type': 'button',
    '[attr.aria-pressed]': 'pinned()',
    '(click)': 'toggle($event)',
  },
})
export class NdwuColumnPinComponent {
  protected readonly ICON_NAME = ICON_NAME;
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly pinned = input(false, {transform: booleanAttribute});
  public readonly pinTexts = input<NdwuTableTranslationTexts['columnPin']>();

  public readonly pinnedChange = output<boolean>();

  protected readonly rootClass = computed(() => {
    const classes = ['ndwu-column-pin', `ndwu-column-pin--${this.sizeSvc.effectiveSize()}`];

    if (this.pinned()) {
      classes.push('ndwu-column-pin--active');
    }

    return classes.join(' ');
  });

  protected readonly effectiveTexts = computed(() => {
    return {
      ...DEFAULT_COLUMN_PIN_TEXTS,
      ...this.pinTexts(),
    };
  });

  // Hidden text, not `aria-label`, so a host `aria-label` still wins.
  protected readonly label = computed(() => {
    return this.pinned() ? this.effectiveTexts().unpin : this.effectiveTexts().pin;
  });

  protected toggle(event: Event): void {
    // The pin usually sits inside a sort header, which would otherwise sort.
    event.stopPropagation();
    this.pinnedChange.emit(!this.pinned());
  }
}
