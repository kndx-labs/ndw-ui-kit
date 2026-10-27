import {NDWU_SIZE} from '../../../../shared.types';
import {NDWU_MODAL_BASE_CONFIG_DEFAULTS} from '../ndwu-modal.constants';
import type {NdwuDrawerConfig} from '../ndwu-modal.types';

export const NDWU_DRAWER_BACKDROP_CLASS = 'ndwu-drawer-backdrop';

export const NDWU_DRAWER_CLOSE_FALLBACK_DURATION = 350;

export const NDWU_DRAWER_PANEL_CLASS = 'ndwu-drawer-panel';

export const NDWU_DRAWER_CONFIG_DEFAULTS: NdwuDrawerConfig = {
  ...NDWU_MODAL_BASE_CONFIG_DEFAULTS,
  backdropClass: NDWU_DRAWER_BACKDROP_CLASS,
  size: NDWU_SIZE.XL,
};
