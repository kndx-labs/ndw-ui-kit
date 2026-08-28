/* eslint no-control-regex: 0 */

export const ERROR_KEY = {
  ASCII_ONLY: 'ASCII_ONLY',
  REQUIRED: 'REQUIRED',
  EMAIL: 'EMAIL',
} as const;

export type ErrorKey = typeof ERROR_KEY[keyof typeof ERROR_KEY];

export const VALIDATION_ERRORS: Record<ErrorKey, string> = {
  [ERROR_KEY.ASCII_ONLY]: 'error.ascii-only',
  [ERROR_KEY.REQUIRED]: 'error.required',
  [ERROR_KEY.EMAIL]: 'error.email',
};

export const VALIDATION_REGEXES: Record<string, RegExp> = {
  [ERROR_KEY.ASCII_ONLY]: /^[\x00-\x7F]*$/,
  [ERROR_KEY.EMAIL]: /^[^@]+@[^@]+\.[^@]+$/,
};
