import {AbstractControl, ValidatorFn} from '@angular/forms';
import {ErrorResult, ValidatorResult} from '../validation.types';

export function ndwuWrapValidator(validator: ValidatorFn, errorLabel: string): ValidatorFn {
  return (control: AbstractControl): ValidatorResult => {
    const errors = validator(control);

    if (!errors) {
      return null;
    }

    const result: ErrorResult = {};

    for (const [key, value] of Object.entries(errors) as [string, unknown][]) {
      const params = value && typeof value === 'object' ? value : {};

      result[key] = {...params, errorLabel};
    }

    return result;
  };
}
