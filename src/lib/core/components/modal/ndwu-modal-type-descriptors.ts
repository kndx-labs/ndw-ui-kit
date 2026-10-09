import type {Type} from '@angular/core';
import type {GlobalPositionStrategy, Overlay, OverlaySizeConfig} from '@angular/cdk/overlay';
import {NDWU_SIZE} from '../../../shared.types';
import type {NdwuModalContainerBaseDirective} from './base';
import {ImmediateCloseStrategy, type NdwuModalCloseStrategy} from './close-strategy';
import {NDWU_DIALOG_CONFIG_DEFAULTS, NDWU_DIALOG_PANEL_CLASS, NdwuDialogContainerComponent} from './dialog';
import {
  NDWU_DRAWER_BACKDROP_CLASS,
  NDWU_DRAWER_CONFIG_DEFAULTS,
  NDWU_DRAWER_HEIGHT,
  NDWU_DRAWER_PANEL_CLASS,
  NDWU_DRAWER_WIDTH,
  NdwuDrawerCloseStrategy,
  NdwuDrawerContainerComponent,
} from './drawer';
import {NDWU_MODAL_BACKDROP_CLASS} from './ndwu-modal.constants';
import type {
  NdwuDialogConfig,
  NdwuDrawerConfig,
  NdwuModalSizeProp,
  NdwuModalType,
  NdwuResolvedModalConfig,
} from './ndwu-modal.types';

// Everything that differs between a dialog and a drawer. `NdwuModalService`
// looks the descriptor up by `config.type` and uses it for config defaults,
// the container component, the close strategy and the overlay config.
// A new modal type is one more entry in `NDWU_MODAL_TYPE_DESCRIPTORS`.
//
// Internal: not exported from the modal `index.ts`.
export interface NdwuModalTypeDescriptor {
  readonly defaults: NdwuDialogConfig | NdwuDrawerConfig;
  readonly containerComponent: Type<NdwuModalContainerBaseDirective>;
  readonly backdropClass: string;
  readonly panelClass: string;
  // Strategies are stateless, so one instance per type is shared.
  readonly closeStrategy: NdwuModalCloseStrategy;
  createPositionStrategy(overlay: Overlay): GlobalPositionStrategy;
  getDesktopSize(config: NdwuResolvedModalConfig): OverlaySizeConfig;
}

const DIALOG_SIZE_PROPS: readonly NdwuModalSizeProp[] = [
  'width',
  'minWidth',
  'maxWidth',
  'height',
  'minHeight',
  'maxHeight',
];

const getDialogDesktopSize = (config: NdwuResolvedModalConfig): OverlaySizeConfig => {
  const desktopSize: Partial<Record<NdwuModalSizeProp, string>> = {};

  DIALOG_SIZE_PROPS.forEach((prop) => {
    const value = config[prop];

    if (value !== undefined) {
      desktopSize[prop] = value;
    }
  });

  return desktopSize;
};

export const NDWU_MODAL_TYPE_DESCRIPTORS: Readonly<Record<NdwuModalType, NdwuModalTypeDescriptor>> = {
  dialog: {
    defaults: NDWU_DIALOG_CONFIG_DEFAULTS,
    containerComponent: NdwuDialogContainerComponent,
    backdropClass: NDWU_MODAL_BACKDROP_CLASS,
    panelClass: NDWU_DIALOG_PANEL_CLASS,
    closeStrategy: new ImmediateCloseStrategy(),
    createPositionStrategy: (overlay) => {
      return overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically();
    },
    getDesktopSize: getDialogDesktopSize,
  },
  drawer: {
    defaults: NDWU_DRAWER_CONFIG_DEFAULTS,
    containerComponent: NdwuDrawerContainerComponent,
    backdropClass: NDWU_DRAWER_BACKDROP_CLASS,
    panelClass: NDWU_DRAWER_PANEL_CLASS,
    closeStrategy: new NdwuDrawerCloseStrategy(),
    createPositionStrategy: (overlay) => {
      return overlay.position()
        .global()
        .right('0')
        .top('0');
    },
    getDesktopSize: (config) => {
      return {
        width: NDWU_DRAWER_WIDTH[config.size ?? NDWU_SIZE.XL],
        height: NDWU_DRAWER_HEIGHT,
        maxHeight: NDWU_DRAWER_HEIGHT,
      };
    },
  },
};
