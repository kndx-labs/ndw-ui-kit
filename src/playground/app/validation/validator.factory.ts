import {AbstractControl, ValidatorFn} from '@angular/forms';
import {ErrorResult, ValidatorError, ValidatorResult} from '@ndw-ui-kit/core/form-field';
import {ERROR_KEY, type ErrorKey, VALIDATION_ERRORS, VALIDATION_REGEXES} from './validation.constants';

export function ERROR(props: ValidatorError): ErrorResult {
  const {key, ...params} = props;
  const errorKey = (key ?? ERROR_KEY.ASCII_ONLY) as ErrorKey;

  return {
    [errorKey]: {
      errorLabel: VALIDATION_ERRORS[errorKey] ?? props.errorLabel,
      ...params,
    },
  };
}

export function SUCCESS(): null {
  return null;
}

export class ValidatorFactory {
  public static regexValidatorConstructor(key: ErrorKey): ValidatorFn {
    if (!VALIDATION_REGEXES[key]) {
      throw new Error(`No regex found for key: ${key}`);
    }

    return (control: AbstractControl): ValidatorResult => {
      const value = control.value;

      if (!value) {
        return SUCCESS();
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const isInvalid = !(VALIDATION_REGEXES[key]!).test(String(value));

      return isInvalid
        ? ERROR({key, value})
        : SUCCESS();
    };
  }
}

export class Validator {
  public static required(control: AbstractControl): ValidatorResult {
    const value = control.value;
    const isInvalid = typeof value === 'undefined' || value === '' || value === null;

    return isInvalid
      ? ERROR({key: ERROR_KEY.REQUIRED, value})
      : SUCCESS();
  }
}
