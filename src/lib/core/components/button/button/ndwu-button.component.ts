import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {SIZE, Values} from '../../../../shared.types';
import {IconName} from '../../../../icon-names';
import {NdwuSizeDirective} from '../../../directives';
import {NdwuIconComponent} from '../../icon/ndwu-icon.component';
import {NdwuSpokesLoaderComponent} from '../../spokes-loader/ndwu-spokes-loader.component';

export const BUTTON_VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
  GHOST: 'ghost',
  SECONDARY_NEGATIVE: 'secondary-negative',
} as const;

export type ButtonVariant = Values<typeof BUTTON_VARIANT>;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwu-button],button[ndwuButton]',
  templateUrl: './ndwu-button.component.html',
  styleUrl: './ndwu-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuIconComponent,
    NdwuSpokesLoaderComponent,
  ],
  host: {
    'attr.type': 'button',
    '[class]': 'hostClasses()',
    '[disabled]': 'disabled()',
  },
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuButtonComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly variant = input<ButtonVariant>(BUTTON_VARIANT.PRIMARY);
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly loading = input(false, {transform: booleanAttribute});
  public readonly icon = input<IconName | null>(null);
  public readonly label = input<string>('');

  protected readonly loaderParams = computed(() => {
    return this.sizeSvc.effectiveSize() === SIZE.XXL
      ? {size: 20, spokeWidth: 1.6, spokeHeight: 4.6, spokeOffset: 0.5}
      : {size: 17, spokeWidth: 1.54, spokeHeight: 4.04, spokeOffset: 0.5};
  });

  protected readonly hostClasses = computed(() => {
    const classes = [
      'ndwu-button',
      `ndwu-button--${this.variant()}`,
      `ndwu-button--${this.sizeSvc.effectiveSize()}`,
    ];

    if (this.icon() && !this.loading()) {
      classes.push('ndwu-button--with-icon');
    }

    if (this.loading()) {
      classes.push('ndwu-button--loading');
    }

    if (this.disabled()) {
      classes.push('ndwu-button--disabled');
    }

    return classes.join(' ');
  });
}
