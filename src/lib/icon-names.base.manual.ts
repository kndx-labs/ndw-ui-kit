/*
 * Manual always-include list for core sprite generation.
 * Keep this list tiny and limited to fallback/compatibility icons.
 */
export const ALWAYS_INCLUDE_BASE_ICON_NAMES = [
  // Required as runtime fallback icon when an unavailable icon is requested.
  'warning_S',
] as const;
