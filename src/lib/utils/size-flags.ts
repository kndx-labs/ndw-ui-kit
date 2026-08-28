import {Signal} from '@angular/core';

export type AdaptiveSize = 'S' | 'L' | 'XL' | 'XXL';

export type NdwuSizeFlags<T extends AdaptiveSize = AdaptiveSize> = Partial<Record<T, Signal<boolean>>>;

export function resolveSizeFlags<T extends AdaptiveSize>(
  flags: NdwuSizeFlags | undefined,
  priority: readonly T[],
): T | undefined {
  if (!flags) {
    return undefined;
  }

  return priority.find((candidate) => flags[candidate]?.());
}
