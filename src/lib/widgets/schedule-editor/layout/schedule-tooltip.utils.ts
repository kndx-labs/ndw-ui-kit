import {TOOLTIP_CURSOR_OFFSET, TOOLTIP_FLIPPED_GAP_PX} from '../ndwu-schedule-editor.constants';
import {Offset, Size} from './schedule-layout.types';

function placeOnAxis(anchor: number, size: number, bounds: number, offset: number): number {
  const after = anchor + offset;
  const position = after + size <= bounds ? after : anchor - TOOLTIP_FLIPPED_GAP_PX - size;

  return Math.min(Math.max(position, 0), Math.max(bounds - size, 0));
}

export function placeTooltip(anchor: Offset, size: Size, bounds: Size): Offset {
  return {
    x: placeOnAxis(anchor.x, size.width, bounds.width, TOOLTIP_CURSOR_OFFSET.x),
    y: placeOnAxis(anchor.y, size.height, bounds.height, TOOLTIP_CURSOR_OFFSET.y),
  };
}
