import {ValidatorError, ValidatorResult} from './validation.types';

export const isSuccess = (result: ValidatorResult): boolean => result === null;

export const isValidationError = (obj: unknown): obj is ValidatorError => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const candidate = obj as {errorLabel?: unknown};

  return typeof candidate.errorLabel === 'string';
};
