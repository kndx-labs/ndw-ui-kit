import {NDWU_MODAL_SWITCH_FADE_IN_CLASS, NDWU_MODAL_SWITCH_FADE_OUT_CLASS} from '../ndwu-modal.constants';

// Single source of truth for which class means "entering" vs "leaving" on a
// switch-animated modal overlay — used by SwitchModalOpenStrategy (on open)
// and SwitchModalCloseStrategy (on close).
export function expandMobileModal(overlayEl: HTMLElement): void {
  overlayEl.classList.remove(NDWU_MODAL_SWITCH_FADE_OUT_CLASS);
  overlayEl.classList.add(NDWU_MODAL_SWITCH_FADE_IN_CLASS);
}

export function collapseMobileModal(overlayEl: HTMLElement): void {
  overlayEl.classList.remove(NDWU_MODAL_SWITCH_FADE_IN_CLASS);
  overlayEl.classList.add(NDWU_MODAL_SWITCH_FADE_OUT_CLASS);
}
