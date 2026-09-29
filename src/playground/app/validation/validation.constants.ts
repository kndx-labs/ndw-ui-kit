/* eslint no-control-regex: 0 */

export const ERROR_KEY = {
  ASCII_ONLY: 'ASCII_ONLY',
  EMAIL: 'EMAIL',
} as const;

export type ErrorKey = typeof ERROR_KEY[keyof typeof ERROR_KEY];

export const VALIDATION_REGEXES: Record<ErrorKey, RegExp> = {
  [ERROR_KEY.ASCII_ONLY]: /^[\x00-\x7F]*$/,
  [ERROR_KEY.EMAIL]: /^[^@]+@[^@]+\.[^@]+$/,
};
