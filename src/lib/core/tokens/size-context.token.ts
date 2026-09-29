import {InjectionToken} from '@angular/core';
import {NdwuSize} from '../../shared.types';

/**
 * Injection token for providing size context from parent components
 * to children. Components can inject this token to inherit size from
 * their parent form container.
 */
export const NDWU_SIZE_TOKEN = new InjectionToken<() => NdwuSize>('NDWU_SIZE_TOKEN');
