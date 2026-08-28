import {InjectionToken} from '@angular/core';
import type {NdwuResolvedModalConfig} from './ndwu-modal.types';
import type {NdwuModalRef} from './ndwu-modal-ref';

export const NDWU_MODAL_DATA = new InjectionToken<unknown>('NDWU_MODAL_DATA');

export const NDWU_MODAL_REF = new InjectionToken<NdwuModalRef>('NDWU_MODAL_REF');

export const NDWU_MODAL_CONFIG = new InjectionToken<NdwuResolvedModalConfig>('NDWU_MODAL_CONFIG');
