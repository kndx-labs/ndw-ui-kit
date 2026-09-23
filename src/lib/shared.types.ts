export const SIZE = {
  S: 'S',
  L: 'L',
  XL: 'XL',
  XXL: 'XXL',
} as const;

export type NdwuValues<T> = T[keyof T];
export type NdwuSize = NdwuValues<typeof SIZE>;

export interface NdwuOption {
  value: string | number;
  label: string;
  secondaryText?: string;
  disabled?: boolean;
  hidden?: boolean;
  groupId?: string;
}

export interface NdwuOptionGroup {
  id: string;
  label: string;
}

// For some item type T, a selector can be either:
export type NdwuOptionFieldSelector<T, R> =
  // - a string key of T, like 'id' or 'name'
  | Extract<keyof T, string>
  // - a function that computes the value, like (item) => item.id
  | ((item: T) => R);

export interface NdwuOptionAdapter<T> {
  value: NdwuOptionFieldSelector<T, string | number>;
  label: NdwuOptionFieldSelector<T, string>;
  secondaryText?: NdwuOptionFieldSelector<T, string | undefined>;
  disabled?: NdwuOptionFieldSelector<T, boolean | undefined>;
  hidden?: NdwuOptionFieldSelector<T, boolean | undefined>;
  groupId?: NdwuOptionFieldSelector<T, string | undefined>;
}

export interface NdwuOptionConfig<T = unknown> {
  optionAdapter?: NdwuOptionAdapter<T>;
}

export type NdwuTheme = 'light' | 'dark';

export type NdwuHelperMessageStatus = 'error' | 'success' | 'warning' | 'default';

export interface NdwuPasswordStrengthHintTexts {
  default?: string;
  weak?: string;
  average?: string;
  strong?: string;
}
