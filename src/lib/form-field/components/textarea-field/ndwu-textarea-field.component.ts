import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {merge} from 'rxjs';
import {
  NDWU_INTERACTION_FOCUS_TYPE,
  type NdwuControl,
  NdwuControlProviderDirective,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuInteractionRegistry,
  NdwuSizeDirective,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NDWU_VALIDATION_PROCESSOR, type NdwuValidationData} from '../../validation';
import {FormFieldBase} from '../../classes/form-field-base';
import {NdwuHelperMessageComponent} from '../helper-message/ndwu-helper-message.component';
import {setValueAccessor} from '../../form-field.utils';

interface ResizeStart {
  pointerY: number;
  height: number;
}

@Component({
  selector: 'ndwu-textarea-field',
  templateUrl: './ndwu-textarea-field.component.html',
  styleUrl: './ndwu-textarea-field.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuControlProviderDirective,
    NdwuFloatingLabelComponent,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  host: {
    '[class]': 'hostClass()',
  },
})
export class NdwuTextareaFieldComponent extends FormFieldBase<string> implements NdwuControl, OnInit {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly validationExtractor = inject(NDWU_VALIDATION_PROCESSOR);
  protected readonly registry = inject(NdwuInteractionRegistry);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly ngControl = inject(NgControl);

  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly ariaLabel = input<string>('');
  public readonly ndwuRequired = input(false, {transform: booleanAttribute});
  public readonly readonly = input(false, {transform: booleanAttribute});
  public readonly resizable = input(true, {transform: booleanAttribute});
  public readonly showLineNumbers = input(false, {transform: booleanAttribute});

  protected readonly idValue = uniqueId('ndwu-textarea-');

  public readonly focused = signal<boolean>(false);
  public readonly shouldLabelFloat = true;

  protected readonly value = signal<string>('');
  protected readonly isDisabledState = signal<boolean>(false);
  protected readonly invalid = signal<boolean>(false);
  protected readonly scrollTop = signal<number>(0);
  protected readonly height = signal<number | null>(null);
  protected readonly extractedValidation = signal<NdwuValidationData | null>(null);

  protected readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  protected readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');

  protected readonly hostClass = computed(() => {
    return `ndwu-textarea-field ndwu-textarea-field--${this.sizeSvc.effectiveSize()}`;
  });

  protected readonly errorMessage = computed(() => {
    return this.invalid()
      ? this.extractedValidation()?.errorMessage ?? ''
      : '';
  });

  protected readonly validationData = computed(() => {
    return this.extractedValidation()?.validationData ?? {};
  });

  protected readonly hasHelperMessage = computed(() => {
    return !!this.errorMessage() || !!this.hint();
  });

  protected readonly lineNumbers = computed(() => {
    const lineCount = this.value().split('\n').length;

    return Array.from({length: lineCount}, (_, index) => index + 1);
  });

  protected readonly syncFocusedWithRegistry = effect(() => {
    this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.id, this.focused());
  });

  private resizeStart: ResizeStart | null = null;

  public get id(): string {
    return this.idValue;
  }

  public get empty(): boolean {
    return !this.value();
  }

  public get disabled(): boolean {
    return this.isDisabledState();
  }

  protected get hintId(): string {
    return `${this.idValue}-hint`;
  }

  constructor() {
    super('');
    setValueAccessor(this.ngControl, this);

    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.id, false);
    });
  }

  public ngOnInit(): void {
    const control = this.ngControl.control;

    if (!control) {
      return;
    }

    const updateValidationState = (): void => {
      this.invalid.set(control.invalid && (control.touched || control.dirty));
      this.extractedValidation.set(this.validationExtractor(control));
    };

    updateValidationState();

    merge(control.statusChanges, control.valueChanges, control.events)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(updateValidationState);
  }

  public override writeValue(value: string | null): void {
    const nextValue = value ?? '';

    super.writeValue(nextValue);
    this.value.set(nextValue);
  }

  public override setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
    this.isDisabledState.set(isDisabled);
  }

  public setFocus(): void {
    this.textarea().nativeElement.focus();
  }

  protected onInput(event: Event): void {
    const {value} = event.target as HTMLTextAreaElement;

    this.value.set(value);
    this.handleChange(value);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  protected onScroll(): void {
    this.scrollTop.set(this.textarea().nativeElement.scrollTop);
  }

  protected onResizeStart(event: PointerEvent): void {
    if (event.button !== 0 || this.isDisabledState()) {
      return;
    }

    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

    this.resizeStart = {
      pointerY: event.clientY,
      height: this.box().nativeElement.getBoundingClientRect().height,
    };
  }

  protected onResizeMove(event: PointerEvent): void {
    if (!this.resizeStart) {
      return;
    }

    this.height.set(Math.max(0, this.resizeStart.height + event.clientY - this.resizeStart.pointerY));
  }

  protected onResizeEnd(): void {
    this.resizeStart = null;
  }
}
