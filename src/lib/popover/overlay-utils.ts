import type {ConnectedPosition, OverlayRef} from '@angular/cdk/overlay';
import type {NdwuPopoverAlign, NdwuPopoverSide} from './ndwu-popover.types';

export const POSITION_OFFSET = 4;
export const VIEWPORT_MARGIN = 8;

const VERTICAL_ALIGN = {
  start: 'top',
  center: 'center',
  end: 'bottom',
} as const satisfies Record<NdwuPopoverAlign, ConnectedPosition['originY']>;

export function buildConnectedPosition(side: NdwuPopoverSide, align: NdwuPopoverAlign): ConnectedPosition {
  switch (side) {
    case 'top':
      return {
        originX: align,
        originY: 'top',
        overlayX: align,
        overlayY: 'bottom',
        offsetY: -POSITION_OFFSET,
      };
    case 'bottom':
      return {
        originX: align,
        originY: 'bottom',
        overlayX: align,
        overlayY: 'top',
        offsetY: POSITION_OFFSET,
      };
    case 'left':
      return {
        originX: 'start',
        originY: VERTICAL_ALIGN[align],
        overlayX: 'end',
        overlayY: VERTICAL_ALIGN[align],
        offsetX: -POSITION_OFFSET,
      };
    case 'right':
      return {
        originX: 'end',
        originY: VERTICAL_ALIGN[align],
        overlayX: 'start',
        overlayY: VERTICAL_ALIGN[align],
        offsetX: POSITION_OFFSET,
      };
  }
}

export const POSITION_BELOW_CENTER: ConnectedPosition = buildConnectedPosition('bottom', 'center');

export const POSITION_ABOVE_CENTER: ConnectedPosition = buildConnectedPosition('top', 'center');

export const POSITION_RIGHT_CENTER: ConnectedPosition = buildConnectedPosition('right', 'center');

export const POSITION_LEFT_CENTER: ConnectedPosition = buildConnectedPosition('left', 'center');

/** Standard fallback order for popover positioning. */
export const STANDARD_POSITIONS: ConnectedPosition[] = [
  POSITION_BELOW_CENTER,
  POSITION_ABOVE_CENTER,
  POSITION_RIGHT_CENTER,
  POSITION_LEFT_CENTER,
];

/**
 * Registers a window scroll listener that updates the overlay position.
 * Returns an unsubscribe function, or null if the overlay element isn't connected.
 */
export function registerOverlayScroll(overlayRef: OverlayRef): (() => void) | null {
  if (!overlayRef.overlayElement?.isConnected) {
    return null;
  }

  const handler = (): void => {
    overlayRef.updatePosition();
  };

  window.addEventListener('scroll', handler, true);

  return () => {
    window.removeEventListener('scroll', handler, true);
  };
}
