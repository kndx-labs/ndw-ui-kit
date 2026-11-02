import type {ConnectedPosition} from '@angular/cdk/overlay';
import {buildConnectedPosition} from '../../overlay-utils';
import type {NdwuPopoverAlign, NdwuPopoverSide} from '../../ndwu-popover.types';

export const buildPopoverPositions = (side: NdwuPopoverSide, align: NdwuPopoverAlign): ConnectedPosition[] => {
  switch (side) {
    case 'top':
      return [
        buildConnectedPosition('top', align),
        buildConnectedPosition('bottom', align),
        buildConnectedPosition('right', 'center'),
        buildConnectedPosition('left', 'center'),
      ];

    case 'bottom':
      return [
        buildConnectedPosition('bottom', align),
        buildConnectedPosition('top', align),
        buildConnectedPosition('right', 'center'),
        buildConnectedPosition('left', 'center'),
      ];

    case 'left':
      return [
        buildConnectedPosition('left', align),
        buildConnectedPosition('right', align),
        buildConnectedPosition('bottom', 'center'),
        buildConnectedPosition('top', 'center'),
      ];

    case 'right':
      return [
        buildConnectedPosition('right', align),
        buildConnectedPosition('left', align),
        buildConnectedPosition('bottom', 'center'),
        buildConnectedPosition('top', 'center'),
      ];
  }
};
