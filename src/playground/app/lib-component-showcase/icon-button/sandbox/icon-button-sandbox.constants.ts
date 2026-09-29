import {NDWU_ICON_BUTTON_VARIANT, NDWU_ICON_NAME, NdwuIconName, NdwuOption} from '@ndw-ui-kit/core';

export const ICON_BUTTON_TOKENS = [
  'icon-button-icon',
  'icon-button-bg',
  'icon-button-border',
  'icon-button-hover-bg',
  'icon-button-focus-border',
  'icon-button-focus-outline',
  'icon-button-active-bg',
  'icon-button-disabled-bg',
  'icon-button-disabled-border',
  'icon-button-disabled-icon',
  'icon-button-flat-icon',
  'icon-button-flat-hover-icon',
  'icon-button-flat-focus-bg',
  'icon-button-flat-focus-icon',
  'icon-button-flat-active-icon',
  'icon-button-flat-disabled-icon',
];

export const ICON_NAMES: NdwuIconName[] = [
  NDWU_ICON_NAME.CHECK_S,
  NDWU_ICON_NAME.CLOSE_S,
  NDWU_ICON_NAME.SEARCH_L,
  NDWU_ICON_NAME.EDIT_L,
  NDWU_ICON_NAME.TRASH_L,
];

export const ICON_BUTTON_VARIANT_OPTIONS: NdwuOption[] = [
  {value: NDWU_ICON_BUTTON_VARIANT.SQUARE, label: 'icon-button-showcase.sandbox.button-variant.option.square'},
  {value: NDWU_ICON_BUTTON_VARIANT.ROUND, label: 'icon-button-showcase.sandbox.button-variant.option.round'},
  {value: NDWU_ICON_BUTTON_VARIANT.FLAT, label: 'icon-button-showcase.sandbox.button-variant.option.flat'},
];
