import {Component, booleanAttribute, computed, inject, input} from '@angular/core';
import {NdwuValues} from '../../../../shared.types';
import {NdwuSizeDirective} from '../../../directives';
import {NdwuIconName} from '../../../../icon-names';
import {NdwuIconComponent} from '../../icon/ndwu-icon.component';

export const NDWU_ICON_BUTTON_VARIANT = {
  FLAT: 'flat',
  ROUND: 'round',
  SQUARE: 'square',
} as const;

export type NdwuIconButtonVariant = NdwuValues<typeof NDWU_ICON_BUTTON_VARIANT>;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwu-icon-button],button[ndwuIconButton]',
  templateUrl: './ndwu-icon-button.component.html',
  styleUrl: './ndwu-icon-button.component.scss',
  host: {
    'attr.type': 'button',
    '[class]': 'hostClasses()',
    '[disabled]': 'disabled() || null',
  },
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  imports: [
    NdwuIconComponent,
  ],
})
export class NdwuIconButtonComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly icon = input.required<NdwuIconName>();
  public readonly variant = input<NdwuIconButtonVariant>(NDWU_ICON_BUTTON_VARIANT.SQUARE);
  public readonly disabled = input(false, {transform: booleanAttribute});

  protected readonly hostClasses = computed(() => {
    const classes = [
      'ndwu-icon-button',
      `ndwu-icon-button--${this.variant()}`,
    ];

    // For the `NDWU_ICON_BUTTON_VARIANT.FLAT` variant, we add the size class based on the icon size.
    // Icon names end with either '_L' or '_S' for 24x24 and 20x20 icons, respectively.
    if (this.variant() === NDWU_ICON_BUTTON_VARIANT.FLAT) {
      const iconNameChunks = this.icon().split('_');
      const iconSizeSuffix = iconNameChunks[iconNameChunks.length - 1];

      classes.push(`ndwu-icon-button--${iconSizeSuffix}`);
    } else {
      classes.push(`ndwu-icon-button--${this.sizeSvc.effectiveSize()}`);
    }

    return classes.join(' ');
  });
}
