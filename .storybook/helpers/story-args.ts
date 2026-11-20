import {NdwuSize} from '@ndw-ui-kit/core';

export interface SizeArg {
  size?: NdwuSize | undefined;
}

export interface AriaArgs {
  'aria-label': string | null;
  'aria-labelledby': string | null;
  'aria-describedby': string | null;
}

export type AdaptiveSizeMode = 'unbound' | 'viewport';

export interface AdaptiveSizeArg {
  adaptiveSize: AdaptiveSizeMode;
}
