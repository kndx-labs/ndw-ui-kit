import {ControlValueAccessor} from '@angular/forms';

export abstract class FormFieldBase<T> implements ControlValueAccessor {
  protected inputValue: T;
  protected isDisabled: boolean = false;
  protected isTouched: boolean = false;

  constructor(
    defaultValue: T,
  ) {
    this.inputValue = defaultValue;
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
  public onTouched(): void {
    this.isTouched = true;
  }

  /** Default change handler */
  public handleChange(value: T): void {
    this.inputValue = value;

    this.onChange(value);
    this.onTouched();
  }
}
