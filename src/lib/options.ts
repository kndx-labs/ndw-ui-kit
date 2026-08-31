import {InjectionToken, isDevMode} from '@angular/core';
import type {NdwuOption, NdwuOptionAdapter, NdwuOptionConfig} from './shared.types';

export const NDWU_OPTION_CONFIG = new InjectionToken<NdwuOptionConfig<unknown> | null>(
  'NDWU_OPTION_CONFIG',
  {factory: () => null},
);

export const NDWU_DEFAULT_OPTION_ADAPTER: NdwuOptionAdapter<NdwuOption> = {
  value: 'value',
  label: 'label',
  secondaryText: 'secondaryText',
  disabled: 'disabled',
  hidden: 'hidden',
  groupId: 'groupId',
};

/**
 * Resolves the option adapter from the resolution chain:
 *   explicit adapter > DI config > built-in identity adapter for NdwuOption.
 */
export function resolveOptionsAdapter<T>(
  explicitAdapter: NdwuOptionAdapter<T> | undefined,
  diConfig: NdwuOptionConfig<unknown> | null,
): NdwuOptionAdapter<T> {
  return explicitAdapter
    ?? (diConfig?.optionAdapter as NdwuOptionAdapter<T> | undefined)
    ?? NDWU_DEFAULT_OPTION_ADAPTER as NdwuOptionAdapter<T>;
}

function resolve<T, R>(item: T, selector: Extract<keyof T, string> | ((item: T) => R)): R {
  if (typeof selector === 'function') {
    return selector(item);
  }

  return item[selector] as unknown as R;
}

export function normalizeOptions<T>(
  items: readonly T[],
  adapter: NdwuOptionAdapter<T>,
): NdwuOption[] {
  const seen = new Set<unknown>();

  return items.map((item, index) => {
    const value = resolve(item, adapter.value);

    if (isDevMode()) {
      const label = resolve(item, adapter.label);

      if (value === null || value === undefined) {
        console.warn(
          `[ndw-ui-kit] normalizeOptions: item at index ${index} resolved value to ${value} via adapter.`,
        );
      }

      if (label === null || label === undefined) {
        console.warn(
          `[ndw-ui-kit] normalizeOptions: item at index ${index} resolved label to ${label} via adapter.`,
        );
      }

      if (seen.has(value)) {
        console.warn(
          `[ndw-ui-kit] normalizeOptions: duplicate value "${value}" at index ${index}. @for tracking may break.`,
        );
      }
    }

    seen.add(value);

    const secondaryText = adapter.secondaryText
      ? resolve(item, adapter.secondaryText)
      : undefined;
    const groupId = adapter.groupId
      ? resolve(item, adapter.groupId)
      : undefined;

    const normalized: NdwuOption = {
      value,
      label: String(resolve(item, adapter.label)),
      disabled: adapter.disabled
        ? !!resolve(item, adapter.disabled)
        : false,
      hidden: adapter.hidden
        ? !!resolve(item, adapter.hidden)
        : false,
    };

    if (secondaryText !== undefined) {
      normalized.secondaryText = secondaryText;
    }

    if (groupId !== undefined) {
      normalized.groupId = groupId;
    }

    return normalized;
  });
}
