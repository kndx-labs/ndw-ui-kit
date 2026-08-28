import {InjectionToken} from '@angular/core';
import {Size} from '../../shared.types';

/**
 * Injection token for providing size context from parent components
 * to children. Components can inject this token to inherit size from
 * their parent form container.
 */
export const NDWU_SIZE_TOKEN = new InjectionToken<() => Size>('NDWU_SIZE_TOKEN');
