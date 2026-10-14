import {NdwuValidatorError, NdwuValidatorResult} from './validation.types';

export const ndwuIsSuccess = (result: NdwuValidatorResult): boolean => result === null;

export const ndwuIsValidationError = (obj: unknown): obj is NdwuValidatorError => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const candidate = obj as {errorLabel?: unknown};

  return typeof candidate.errorLabel === 'string';
};
