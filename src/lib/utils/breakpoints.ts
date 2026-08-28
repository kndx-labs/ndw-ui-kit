import {Breakpoints} from '@angular/cdk/layout';

/**
 * Media query string for the "handset" (mobile) breakpoint.
 *
 * Re-exports `Breakpoints.Handset` from `@angular/cdk/layout`.
 * The scripts counterpart (`HANDSET_BREAKPOINT` in `scripts/conf.ts`) hard-codes
 * the same value to avoid pulling Angular platform code into a plain Node.js context.
 */
export const HANDSET_BREAKPOINT = Breakpoints.Handset;
