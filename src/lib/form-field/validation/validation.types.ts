import {AbstractControl} from '@angular/forms';

export interface ValidatorError {
  value?: any;
  errorLabel?: string;
  [propName: string]: any;
}

export type ErrorResult = Record<string, ValidatorError>;

export type ValidatorResult = ErrorResult | null;

/**
 * UI-friendly validation payload extracted from an Angular `AbstractControl`.
 *
 * `errorMessage` is typically a translation key.
 * `validationData` is any extra data required to fill placeholders in the `errorMessage`
 */
export interface NdwuValidationData {
  errorMessage: string;
  validationData?: Record<string, any>;
}

export type NdwuValidationErrorProcessor = (control: AbstractControl) => NdwuValidationData | null;
