import {NDWU_VALIDATION_ERROR_LABEL, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {ERROR_KEY, VALIDATION_REGEXES} from './validation.constants';

export const EMAIL_VALIDATOR = NdwuValidators.pattern(
  VALIDATION_REGEXES[ERROR_KEY.EMAIL],
  NDWU_VALIDATION_ERROR_LABEL.EMAIL,
);
