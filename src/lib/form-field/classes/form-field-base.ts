import {DestroyRef, Directive, computed, inject, signal} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {NDWU_VALIDATION_PROCESSOR} from '../validation/validation-processor.token';
import type {NdwuValidationData} from '../validation';
import {isControlInvalid, onControlStateChange, setValueAccessor} from '../form-field.utils';

@Directive() // to be able to use the Angular DI mechanism
export abstract class FormFieldBase<T> implements ControlValueAccessor {
  protected readonly ngControl = inject(NgControl, {self: true, optional: true});
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly validationExtractor = inject(NDWU_VALIDATION_PROCESSOR);

  protected inputValue: T;
  protected isDisabled: boolean = false;

  /** `control.invalid && (control.touched || control.dirty)` */
  public readonly isInvalid = signal<boolean>(false);

  protected readonly extractedValidation = signal<NdwuValidationData | null>(null);

  protected readonly errorMessage = computed(() => {
    return this.isInvalid() ? this.extractedValidation()?.errorMessage ?? '' : '';
  });

  protected readonly validationData = computed(() => {
    return this.extractedValidation()?.validationData ?? {};
  });

  private isValidationStateInitialized: boolean = false;

  constructor(
    defaultValue: T,
  ) {
    this.inputValue = defaultValue;

    if (this.ngControl) {
      setValueAccessor(this.ngControl, this);
    }
  }

  /** Writes a new value to the element. */
  public writeValue(value: T): void {
    this.inputValue = value;
  }

  /**
   * Registers a callback function that is called
   * when the control's value changes in the UI.
   */
  public registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  /**
   * Registers a callback function that is called
   * by the forms API on initialization to update the form model on blur.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * The registered callback function called when
   * an input event occurs on the input element.
   */
  public onChange = (_: T): void => {};

  /**
   * Changes 'disabled' state of the control
   */
  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  /**
   * The registered callback function called
   * when a blur event occurs on the input element.
   */
  public onTouched = (): void => {};

  /** Default change handler */
  public handleChange(value: T): void {
    this.inputValue = value;

    this.onChange(value);
    this.onTouched();
  }

  /**
   * Syncs `isInvalid` and `extractedValidation` with the bound control.
   * Call this from `ngOnInit`: `FormControlName` gets its control only after
   * the directive's `ngOnChanges`. No-op without a control; idempotent.
   */
  protected initValidationState(): void {
    const control = this.ngControl?.control;

    if (!control || this.isValidationStateInitialized) {
      return;
    }

    this.isValidationStateInitialized = true;

    onControlStateChange(
      control,
      this.destroyRef,
      () => {
        this.isInvalid.set(isControlInvalid(control));
        this.extractedValidation.set(this.validationExtractor(control));
      },
    );
  }
}
