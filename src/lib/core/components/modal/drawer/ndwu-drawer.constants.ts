import {NDWU_SIZE} from '../../../../shared.types';
import {NDWU_MODAL_BASE_CONFIG_DEFAULTS} from '../ndwu-modal.constants';
import type {NdwuDrawerConfig, NdwuDrawerSize} from '../ndwu-modal.types';

export const NDWU_DRAWER_BACKDROP_CLASS = 'ndwu-drawer-backdrop';

export const NDWU_DRAWER_CLOSE_FALLBACK_DURATION = 350;

export const NDWU_DRAWER_PANEL_CLASS = 'ndwu-drawer-panel';

// Keep in sync with `--drawer-width` in ndwu-drawer-container.component.scss
export const NDWU_DRAWER_WIDTH: Readonly<Record<NdwuDrawerSize, string>> = {
  [NDWU_SIZE.XL]: '700px',
  [NDWU_SIZE.XXL]: '1200px',
};

export const NDWU_DRAWER_HEIGHT = '100vh';

export const NDWU_DRAWER_CONFIG_DEFAULTS: NdwuDrawerConfig = {
  ...NDWU_MODAL_BASE_CONFIG_DEFAULTS,
  backdropClass: NDWU_DRAWER_BACKDROP_CLASS,
  size: NDWU_SIZE.XL,
};
