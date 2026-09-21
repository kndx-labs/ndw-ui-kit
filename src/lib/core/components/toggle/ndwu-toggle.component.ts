import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuSizeDirective} from '../../directives';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../interaction';
import {NdwuLabelGroupComponent} from '../label-group/ndwu-label-group.component';
import {TOGGLE_COLOR, coerceToggleColor} from './ndwu-toggle.types';

@Component({
  selector: 'ndwu-toggle',
  templateUrl: './ndwu-toggle.component.html',
  styleUrl: './ndwu-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuLabelGroupComponent,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuToggleComponent {
  public readonly checked = input(false, {transform: booleanAttribute});
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly label = input<string>('');

  /** Keeps `label` as the accessible name while removing it from the layout. */
  public readonly labelHidden = input(false, {transform: booleanAttribute});
  public readonly secondaryText = input<string>('');
  public readonly color = input(TOGGLE_COLOR.BRAND, {transform: coerceToggleColor});

  public readonly checkedChange = output<boolean>();
  public readonly blurred = output<void>();
  public readonly focused = output<void>();

  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly registry = inject(NdwuInteractionRegistry);
  protected readonly toggleId: string = uniqueId('ndwu-toggle-');
  protected readonly focusedState = signal(false);

  constructor() {
    // sync `focus` state with `NdwuInteractionRegistry`
    effect(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.TOGGLE, this.toggleId, this.focusedState());
    });

    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.TOGGLE, this.toggleId, false);
    });
  }

  protected readonly rootClass = computed(() => {
    const colorClass = `ndwu-toggle--${this.color()}`;
    const sizeClass = `ndwu-toggle--${this.sizeSvc.effectiveSize()}`;
    const checkedClass = this.checked() ? 'ndwu-toggle--checked' : '';

    return `ndwu-toggle ${colorClass} ${sizeClass} ${checkedClass}`.trim();
  });

  public onFocus(): void {
    this.focusedState.set(true);
    this.focused.emit();
  }

  public onBlur(): void {
    this.focusedState.set(false);
    this.blurred.emit();
  }

  public onToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.checkedChange.emit(target.checked);
  }
}
