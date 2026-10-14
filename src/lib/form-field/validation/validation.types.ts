import {AbstractControl} from '@angular/forms';

export interface NdwuValidatorError {
  value?: any;
  errorLabel?: string;
  [propName: string]: any;
}

export type NdwuErrorResult = Record<string, NdwuValidatorError>;

export type NdwuValidatorResult = NdwuErrorResult | null;

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
