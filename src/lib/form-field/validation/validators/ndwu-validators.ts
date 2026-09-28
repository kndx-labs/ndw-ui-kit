import {ValidatorFn, Validators} from '@angular/forms';
import {NDWU_VALIDATION_ERROR_LABEL} from './ndwu-validation-error-label.constants';
import {ndwuWrapValidator} from './ndwu-wrap-validator';

export class NdwuValidators {
  public static required(errorLabel: string = NDWU_VALIDATION_ERROR_LABEL.REQUIRED): ValidatorFn {
    return ndwuWrapValidator(Validators.required, errorLabel);
  }

  public static requiredTrue(errorLabel: string = NDWU_VALIDATION_ERROR_LABEL.REQUIRED_TRUE): ValidatorFn {
    return ndwuWrapValidator(Validators.requiredTrue, errorLabel);
  }

  public static email(errorLabel: string = NDWU_VALIDATION_ERROR_LABEL.EMAIL): ValidatorFn {
    return ndwuWrapValidator(Validators.email, errorLabel);
  }

  public static min(min: number, errorLabel: string = NDWU_VALIDATION_ERROR_LABEL.MIN): ValidatorFn {
    return ndwuWrapValidator(Validators.min(min), errorLabel);
  }

  public static max(max: number, errorLabel: string = NDWU_VALIDATION_ERROR_LABEL.MAX): ValidatorFn {
    return ndwuWrapValidator(Validators.max(max), errorLabel);
  }

  public static minLength(minLength: number, errorLabel: string = NDWU_VALIDATION_ERROR_LABEL.MIN_LENGTH): ValidatorFn {
    return ndwuWrapValidator(Validators.minLength(minLength), errorLabel);
  }

  public static maxLength(maxLength: number, errorLabel: string = NDWU_VALIDATION_ERROR_LABEL.MAX_LENGTH): ValidatorFn {
    return ndwuWrapValidator(Validators.maxLength(maxLength), errorLabel);
  }

  public static pattern(
    pattern: string | RegExp,
    errorLabel: string = NDWU_VALIDATION_ERROR_LABEL.PATTERN,
  ): ValidatorFn {
    return ndwuWrapValidator(Validators.pattern(pattern), errorLabel);
  }
}
