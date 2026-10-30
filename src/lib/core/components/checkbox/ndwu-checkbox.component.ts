import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuSizeDirective} from '../../directives';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../../services';
import {NdwuLabelGroupComponent} from '../label-group/ndwu-label-group.component';

@Component({
  selector: 'ndwu-checkbox',
  templateUrl: './ndwu-checkbox.component.html',
  styleUrl: './ndwu-checkbox.component.scss',
  imports: [
    NdwuLabelGroupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  host: {
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
  },
})
export class NdwuCheckboxComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly registry = inject(NdwuInteractionRegistry);
  protected readonly componentId = uniqueId('ndwu-checkbox-');
  protected readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('checkboxInput');
  protected readonly focusedState = signal(false);

  public readonly id = input<string>('');
  public readonly checked = input(false, {transform: booleanAttribute});
  public readonly indeterminate = input(false, {transform: booleanAttribute});
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly invalid = input(false, {transform: booleanAttribute});
  public readonly required = input(false, {transform: booleanAttribute});

  public readonly name = input<string | null>(null);
  public readonly value = input<string | null>(null);
  public readonly ariaLabel = input<string | null>(null, {alias: 'aria-label'});
  public readonly ariaLabelledby = input<string | null>(null, {alias: 'aria-labelledby'});
  public readonly ariaDescribedby = input<string | null>(null, {alias: 'aria-describedby'});

  public readonly inputTabIndex = input<number | null>(null);

  public readonly label = input<string>('');
  public readonly secondaryText = input<string>('');

  public readonly checkedChange = output<boolean>();
  public readonly blurred = output<void>();
  public readonly focused = output<void>();

  protected readonly inputId = computed(() => {
    return this.id() || this.componentId;
  });

  constructor() {
    effect(() => {
      const ref = this.inputRef();
      const inputEl = ref?.nativeElement;

      if (inputEl) {
        inputEl.indeterminate = this.indeterminate();
      }
    });

    // sync `focus` state with `NdwuInteractionRegistry`
    effect(() => {
      const focused = this.focusedState();

      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.CHECKBOX, this.inputId(), focused);
    });

    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.CHECKBOX, this.inputId(), false);
    });
  }

  protected readonly rootClass = computed(() => {
    const sizeClass = `ndwu-checkbox--${this.sizeSvc.effectiveSize()}`;
    const disabledClass = this.disabled() ? 'ndwu-checkbox--disabled' : '';

    return `ndwu-checkbox ${sizeClass} ${disabledClass}`.trim();
  });

  public onFocus(): void {
    this.focusedState.set(true);
    this.focused.emit();
  }

  public onBlur(): void {
    this.focusedState.set(false);
    this.blurred.emit();
  }

  public onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.checkedChange.emit(target.checked);
  }
}
