import {ndwuIsValidationError} from '../validation.utils';
import {NdwuValidationErrorProcessor} from '../validation.types';

/*
 * Default NDW UI Kit validation processor.
 */
export const ndwuValidationProcessor: NdwuValidationErrorProcessor = (control) => {
  const errors = control?.errors;

  if (!errors) {
    return null;
  }

  const errorValue = Object.values(errors)?.[0];

  if (!ndwuIsValidationError(errorValue)) {
    return null;
  }

  return {
    errorMessage: String(errorValue.errorLabel),
    validationData: errorValue,
  };
};
