import type {NdwuModalConfig} from '../ndwu-modal.types';

export const NDWU_DRAWER_BACKDROP_CLASS = 'ndwu-drawer-backdrop';

export const NDWU_DRAWER_CLOSE_FALLBACK_DURATION = 350;

export const NDWU_DRAWER_PANEL_CLASS = 'ndwu-drawer-panel';

export const NDWU_DRAWER_OVERLAY_DEFAULTS: Partial<NdwuModalConfig> = {
  backdropClass: NDWU_DRAWER_BACKDROP_CLASS,
  width: '700px',
  height: '100vh',
  maxHeight: '100vh',
  disableClose: false,
  trapFocus: true,
  autoFocus: 'first-heading' as const,
  restoreFocus: true,
};
