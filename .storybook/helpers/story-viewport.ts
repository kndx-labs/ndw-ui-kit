import {Signal, computed, signal} from '@angular/core';
import {AdaptiveSize, HANDSET_BREAKPOINT, NdwuSizeFlags} from '@ndw-ui-kit/core/utils';
import {AdaptiveSizeMode} from './story-args';

const handsetQuery = window.matchMedia(HANDSET_BREAKPOINT);
const isHandset = signal(handsetQuery.matches);
const isWide: Signal<boolean> = computed(() => !isHandset());

handsetQuery.addEventListener('change', (event) => isHandset.set(event.matches));

export const viewportSizeFlags = <T extends AdaptiveSize>(wide: T, handset: T): NdwuSizeFlags<T> => {
  const flags: NdwuSizeFlags<T> = {};

  flags[wide] = isWide;
  flags[handset] = isHandset.asReadonly();

  return flags;
};

export const adaptiveSizeBinding = (mode: AdaptiveSizeMode): string => {
  return mode === 'viewport' ? '[adaptiveSize]="sizeFlags"' : '';
};
