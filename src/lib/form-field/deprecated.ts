import {ndwuNoopValidationProcessor} from './validation/processors/noop-validation.processor';
import {NdwuErrorResult, NdwuValidatorError, NdwuValidatorResult} from './validation/validation.types';
import {ndwuIsSuccess, ndwuIsValidationError} from './validation/validation.utils';

/** @deprecated Use `NdwuValidatorError` instead. Will be removed in a future minor release. */
export type ValidatorError = NdwuValidatorError;

/** @deprecated Use `NdwuErrorResult` instead. Will be removed in a future minor release. */
export type ErrorResult = NdwuErrorResult;

/** @deprecated Use `NdwuValidatorResult` instead. Will be removed in a future minor release. */
export type ValidatorResult = NdwuValidatorResult;

/** @deprecated Use `ndwuNoopValidationProcessor` instead. Will be removed in a future minor release. */
export const noopValidationProcessor = ndwuNoopValidationProcessor;

/** @deprecated Use `ndwuIsSuccess` instead. Will be removed in a future minor release. */
export const isSuccess = ndwuIsSuccess;

/** @deprecated Use `ndwuIsValidationError` instead. Will be removed in a future minor release. */
export const isValidationError = ndwuIsValidationError;
