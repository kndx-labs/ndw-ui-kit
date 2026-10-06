import {NDWU_MODAL_BASE_CONFIG_DEFAULTS} from '../ndwu-modal.constants';
import type {NdwuDialogConfig} from '../ndwu-modal.types';

export const NDWU_DIALOG_PANEL_CLASS = 'ndwu-dialog-panel';

export const NDWU_DIALOG_CONFIG_DEFAULTS: NdwuDialogConfig = {
  ...NDWU_MODAL_BASE_CONFIG_DEFAULTS,
  width: 'auto',
  maxWidth: '90vw',
  maxHeight: '90vh',
};
