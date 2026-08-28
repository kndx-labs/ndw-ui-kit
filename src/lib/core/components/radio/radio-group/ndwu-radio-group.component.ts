import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuSizeDirective} from '../../../directives';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../../interaction';
import {NDWU_RADIO_GROUP, NdwuRadioGroup} from '../radio.types';

@Component({
  selector: 'ndwu-radio-group',
  templateUrl: './ndwu-radio-group.component.html',
  styleUrl: './ndwu-radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [
    {provide: NDWU_RADIO_GROUP, useExisting: NdwuRadioGroupComponent},
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuRadioGroupComponent implements NdwuRadioGroup {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly sizeSvc = inject(NdwuSizeDirective);
  private readonly destroyRef = inject(DestroyRef);
  private readonly registry = inject(NdwuInteractionRegistry);
  public readonly effectiveSize = this.sizeSvc.effectiveSize;

  public readonly name = input<string | undefined>(undefined);
  public readonly value = input<string | number>('');
  public readonly disabled = input<boolean>(false);

  public readonly valueChange = output<string | number>();
  public readonly blurred = output<void>();

  protected readonly generatedName = uniqueId('ndwu-radio-group-');
  protected readonly focusedState = signal(false);

  constructor() {
    // sync `focus` state with `NdwuInteractionRegistry`
    effect(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.RADIO, this.generatedName, this.focusedState());
    });

    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.RADIO, this.generatedName, false);
    });
  }

  protected readonly rootClass = computed(() => {
    return `ndwu-radio ndwu-radio--${this.effectiveSize()}`;
  });

  public readonly groupName = computed(() => {
    return this.name() || this.generatedName;
  });

  public isSelected(value: string | number): boolean {
    return this.value() === value;
  }

  public select(value: string | number): void {
    if (this.disabled()) {
      return;
    }

    this.valueChange.emit(value);
  }

  @HostListener('focusin')
  public onFocusIn(): void {
    this.focusedState.set(true);
  }

  @HostListener('focusout', ['$event'])
  public onFocusOut(event: FocusEvent): void {
    const nextFocused = event.relatedTarget;

    if (nextFocused instanceof Node && this.hostRef.nativeElement.contains(nextFocused)) {
      return;
    }

    if (!this.focusedState()) {
      return;
    }

    this.focusedState.set(false);
    this.blurred.emit();
  }
}
