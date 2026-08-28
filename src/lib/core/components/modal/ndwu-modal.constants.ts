import {NdwuModalConfig} from './ndwu-modal.types';

export const NDWU_MODAL_CSS_CLASS = 'ndwu-modal';

export const NDWU_MODAL_BACKDROP_CLASS = 'ndwu-modal-backdrop';

export const NDWU_MODAL_CONFIG_DEFAULTS: NdwuModalConfig = {
  disableClose: false,
  hasCloseButton: true,
  backdropClass: NDWU_MODAL_BACKDROP_CLASS,
  width: 'auto',
  maxWidth: '90vw',
  maxHeight: '90vh',
  trapFocus: true,
  autoFocus: 'first-heading',
  restoreFocus: true,
  isLoading: false,
  closeButtonAriaLabel: 'Close',
};

export const NDWU_MODAL_HANDSET_OVERLAY_SIZE = {
  width: '100vw',
  height: '100dvh',
  maxWidth: '100vw',
  maxHeight: '100dvh',
} as const;

// Mobile-only crossfade played when one dialog switches for another (see SwitchModalCloseStrategy).
export const NDWU_MODAL_SWITCH_FADE_OUT_CLASS = 'ndwu-modal--fade-out';
export const NDWU_MODAL_SWITCH_FADE_IN_CLASS = 'ndwu-modal--fade-in';
export const NDWU_MODAL_SWITCH_DURATION_MS = 300;
