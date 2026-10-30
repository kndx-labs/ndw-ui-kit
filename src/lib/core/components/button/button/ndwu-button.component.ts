import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NDWU_SIZE, NdwuValues} from '../../../../shared.types';
import {NdwuIconName} from '../../../../icon-names';
import {NdwuSizeDirective} from '../../../directives';
import {NdwuIconComponent} from '../../icon/ndwu-icon.component';
import {NdwuSpokesLoaderComponent} from '../../spokes-loader/ndwu-spokes-loader.component';
import {blockClickWhileLoading} from '../ndwu-button.utils';

export const NDWU_BUTTON_VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
  GHOST: 'ghost',
  SECONDARY_NEGATIVE: 'secondary-negative',
} as const;

export type NdwuButtonVariant = NdwuValues<typeof NDWU_BUTTON_VARIANT>;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwu-button],button[ndwuButton]',
  templateUrl: './ndwu-button.component.html',
  styleUrl: './ndwu-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuLocalizePipe,
    NdwuIconComponent,
    NdwuSpokesLoaderComponent,
  ],
  host: {
    'type': 'button',
    '[class]': 'hostClasses()',
    '[disabled]': 'disabled()',
    '[attr.aria-disabled]': 'effectiveLoading() || null',
    '[attr.aria-busy]': 'effectiveLoading() || null',
    '(keydown)': 'onKey($event)',
    '(keyup)': 'onKey($event)',
  },
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuButtonComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  public readonly variant = input<NdwuButtonVariant>(NDWU_BUTTON_VARIANT.PRIMARY);
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly loading = input(false, {transform: booleanAttribute});
  public readonly icon = input<NdwuIconName | null>(null);
  public readonly label = input<string>('');

  // `disabled` takes precedence over `loading`
  protected readonly effectiveLoading = computed(() => {
    return this.loading() && !this.disabled();
  });

  constructor() {
    blockClickWhileLoading(this.el.nativeElement, this.effectiveLoading, this.destroyRef);
  }

  protected readonly loaderParams = computed(() => {
    return this.sizeSvc.effectiveSize() === NDWU_SIZE.XXL
      ? {size: 20, spokeWidth: 1.6, spokeHeight: 4.6, spokeOffset: 0.5}
      : {size: 17, spokeWidth: 1.54, spokeHeight: 4.04, spokeOffset: 0.5};
  });

  protected readonly hostClasses = computed(() => {
    const classes = [
      'ndwu-button',
      `ndwu-button--${this.variant()}`,
      `ndwu-button--${this.sizeSvc.effectiveSize()}`,
    ];

    if (this.icon()) {
      classes.push('ndwu-button--with-icon');
    }

    if (this.effectiveLoading()) {
      classes.push('ndwu-button--loading');
    }

    if (this.disabled()) {
      classes.push('ndwu-button--disabled');
    }

    return classes.join(' ');
  });

  protected onKey(event: KeyboardEvent): void {
    if (this.effectiveLoading() && event.key !== 'Tab') {
      event.preventDefault();
    }
  }
}
