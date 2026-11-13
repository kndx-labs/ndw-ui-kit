import {FormControl, ReactiveFormsModule, ValidatorFn} from '@angular/forms';
import {ArgTypes, moduleMetadata} from '@storybook/angular';
import {booleanArgType} from './arg-types';

export interface FormControlArgs {
  disabled: boolean;
  touched: boolean;
}

export interface StoryFormControlOptions<T> {
  value: T;
  validators?: ValidatorFn[];
}

const controls = new Map<string, FormControl<unknown>>();
const appliedStates = new WeakMap<FormControl<unknown>, FormControlArgs>();

export const FORM_CONTROL_ARGS: (keyof FormControlArgs)[] = ['disabled', 'touched'];

export const formControlArgTypes: ArgTypes<FormControlArgs> = {
  disabled: {
    ...booleanArgType(
      'Calls `control.disable()` / `enable()`; a `-field` takes its disabled state from the form control',
    ),
    table: {category: 'form control'},
  },
  touched: {
    ...booleanArgType(
      'Calls `control.markAsTouched()`, or `markAsUntouched()` and `markAsPristine()`; an error shows once the control is touched or dirty',
    ),
    table: {category: 'form control'},
  },
};

export const DEFAULT_FORM_CONTROL_ARGS: FormControlArgs = {
  disabled: false,
  touched: false,
};

export const getStoryFormControl = <T>(
  key: string,
  {value, validators = []}: StoryFormControlOptions<T>,
): FormControl<T> => {
  const control = controls.get(key) ?? new FormControl<T>(value, {nonNullable: true, validators});

  controls.set(key, control);

  return control as FormControl<T>;
};

export const setStoryFormControlState = (
  control: FormControl<unknown>,
  {disabled = false, touched = false}: Partial<FormControlArgs>,
): void => {
  const applied = appliedStates.get(control) ?? {disabled: false, touched: false};

  appliedStates.set(control, applied);

  if (applied.disabled !== disabled) {
    if (disabled) {
      control.disable();
    } else {
      control.enable();
    }

    applied.disabled = disabled;
  }

  if (applied.touched !== touched) {
    if (touched) {
      control.markAsTouched();
    } else {
      control.markAsUntouched();
      control.markAsPristine();
    }

    applied.touched = touched;
  }
};

export const withFormControl = moduleMetadata({imports: [ReactiveFormsModule]});
