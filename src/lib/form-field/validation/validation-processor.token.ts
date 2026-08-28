import {InjectionToken} from '@angular/core';
import {NdwuValidationErrorProcessor, ndwuValidationProcessor} from './index';

/**
 * Injection token for a validation processor
 * that transforms generic Angular validation result (`ValidationErrors | null`)
 * to a `NdwValidationData | null` value that is more convenient for showing
 * an error message in the UI.
 */
export const NDWU_VALIDATION_PROCESSOR = new InjectionToken<NdwuValidationErrorProcessor>(
  'NDWU_VALIDATION_PROCESSOR',
  {
    providedIn: 'root',
    factory: () => ndwuValidationProcessor,
  },
);
