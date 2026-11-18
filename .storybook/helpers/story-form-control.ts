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
  disabled?: boolean;
  touched?: boolean;
}

interface StoryFormControlEntry {
  control: FormControl<unknown>;
  disabled: boolean;
  touched: boolean;
}

const entries = new Map<string, StoryFormControlEntry>();

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

export const formControlArgs: FormControlArgs = {
  disabled: false,
  touched: false,
};

const createEntry = <T>(value: T, validators: ValidatorFn[]): StoryFormControlEntry => {
  return {
    control: new FormControl<T>(value, {nonNullable: true, validators}),
    disabled: false,
    touched: false,
  };
};

export const storyFormControl = <T>(
  key: string,
  {value, validators = [], disabled = false, touched = false}: StoryFormControlOptions<T>,
): FormControl<T> => {
  const entry = entries.get(key) ?? createEntry(value, validators);

  entries.set(key, entry);

  if (entry.disabled !== disabled) {
    if (disabled) {
      entry.control.disable();
    } else {
      entry.control.enable();
    }

    entry.disabled = disabled;
  }

  if (entry.touched !== touched) {
    if (touched) {
      entry.control.markAsTouched();
    } else {
      entry.control.markAsUntouched();
      entry.control.markAsPristine();
    }

    entry.touched = touched;
  }

  return entry.control as FormControl<T>;
};

export const withFormControl = moduleMetadata({imports: [ReactiveFormsModule]});
