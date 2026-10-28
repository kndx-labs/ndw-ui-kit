import {NDWU_SCHEDULE_EDITOR_MODE, NdwuScheduleEditorMode} from './schedule-editor.types';
import {Offset, ScheduleEditorCanvasSize, ScheduleEditorOffset} from './layout/schedule-layout.types';

/* --------- Constants used only in this component, not exported from the library ------------- */

export const SLOTS_PER_HOUR = 2;
export const HOURS_IN_DAY = 24;
export const DAYS_IN_WEEK = 7;

export const MINUTES_IN_HOUR = 60;
export const MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR;
export const MINUTES_IN_WEEK = MINUTES_IN_DAY * 7;
export const MINUTES_IN_SLOT = MINUTES_IN_HOUR / SLOTS_PER_HOUR;

export const NOT_FULL_MODE_TEXT_OFFSET = 21;

// Previous scale mode reserved this width in the viewBox for text that could
// otherwise be clipped. Keep it commented while validating the replacement.
// export const AUTOSCALE_EXTRA_WIDTH = 50;

/**
 * Minimum block extent along the time axis, in CSS pixels, for the mobile
 * time labels to render.
 */
export const MIN_BLOCK_TEXT_MOBILE_PX = 20;

/**
 * Desktop interval text ("HH:MM - HH:MM") is drawn only when the block is wide
 * enough to hold it. The budget is derived from the label length rather than a
 * fixed threshold: an approximate glyph advance at the 11px block font, plus the
 * left inset the text is drawn at (mirrors OFFSETS_*.blockText.x).
 */
export const BLOCK_TEXT_GLYPH_WIDTH_PX = 6;
export const BLOCK_TEXT_INSET_PX = 10;

export const HOUR_LABEL_STEPS = [3, 6, 12] as const;

/**
 * Minimum spacing between hour labels, in CSS pixels.
 * Desktop labels run along `x` and are limited by glyph width,
 * mobile labels stack down `y` and are limited by line height.
 */
export const MIN_HOUR_LABEL_WIDTH_PX = 60;
export const MIN_HOUR_LABEL_HEIGHT_PX = 40;
export const MIN_HOUR_LABEL_SHORT_WIDTH_PX = 24;
export const MIN_HOUR_LABEL_SHORT_HEIGHT_PX = 20;

/**
 * Grid extents clamp here rather than at zero: both layouts divide by
 * `hourCellSize` in `coordsToTimeSlot`, and a zero cell size yields NaN at
 * gridX/gridY exactly 0. This is not a minimum canvas size — it never touches
 * the viewBox, so `preserveAspectRatio` never re-engages scaling.
 */
export const MIN_GRID_EXTENT_PX = 1;

/**
 * Constants that determine layout in the "fill" mode. Aspect ratios for the "fixed" mode
 * are 3.11 (desktop) and 0.68 (mobile). The minimum width is an extra px-specific guard.
 */
export const FILL_DESKTOP_MIN_RATIO = 1.6;
export const FILL_DESKTOP_MIN_WIDTH_PX = 560;

export const TOOLTIP_CURSOR_OFFSET: Offset = {x: 10, y: 20};
export const TOOLTIP_FLIPPED_GAP_PX = 10;

const TEXT_CLASS = 'ndwu-schedule-editor__text';
const SLOT_CLASS = 'ndwu-schedule-editor__grid-slot';
const BLOCK_DRAG_CLASS = 'ndwu-schedule-editor__block-drag';

export const AXIS_LABEL_CLASS = TEXT_CLASS;
export const AXIS_LABEL_HOUR_CLASS = `${TEXT_CLASS} ${TEXT_CLASS}--hour`;
export const AXIS_LABEL_DAY_CLASS = `${TEXT_CLASS} ${TEXT_CLASS}--day`;

export const SLOT_RECT_CLASS = SLOT_CLASS;
export const SLOT_RECT_SELECTED_CLASS = `${SLOT_CLASS} ${SLOT_CLASS}--selected`;

export const BLOCK_DRAG_ADD_CLASS = `${BLOCK_DRAG_CLASS} ${BLOCK_DRAG_CLASS}--add`;
export const BLOCK_DRAG_REMOVE_CLASS = `${BLOCK_DRAG_CLASS} ${BLOCK_DRAG_CLASS}--remove`;

export const CANVAS_SIZES_DESKTOP: Record<NdwuScheduleEditorMode, ScheduleEditorCanvasSize> = {
  [NDWU_SCHEDULE_EDITOR_MODE.FULL]: {
    width: 760,
    height: 244,
  },
  [NDWU_SCHEDULE_EDITOR_MODE.THUMBNAIL]: {
    width: 313,
    height: 148,
  },
};

export const CANVAS_SIZES_MOBILE: Record<NdwuScheduleEditorMode, ScheduleEditorCanvasSize> = {
  [NDWU_SCHEDULE_EDITOR_MODE.FULL]: {
    width: 340,
    height: 500,
  },
  [NDWU_SCHEDULE_EDITOR_MODE.THUMBNAIL]: {
    width: 340,
    height: 500,
  },
};

export const OFFSETS_DESKTOP: Record<NdwuScheduleEditorMode, ScheduleEditorOffset> = {
  [NDWU_SCHEDULE_EDITOR_MODE.THUMBNAIL]: {
    top: 15,
    left: 32,
    right: 0,
    bottom: 0,
    viewBoxShift: {x: -2, y: -5},
    blockText: {x: 10, y: 0},
    labelsLeftOffset: {x: -8, y: 0},
    labelsRightOffset: {x: 8, y: 0},
    labelsTopOffset: {x: 0, y: 0},
  },
  [NDWU_SCHEDULE_EDITOR_MODE.FULL]: {
    top: 20,
    left: 35,
    right: 12,
    bottom: 0,
    viewBoxShift: {x: 0, y: 0},
    blockText: {x: 10, y: 0},
    labelsLeftOffset: {x: -6, y: 0},
    labelsRightOffset: {x: 0, y: 0},
    labelsTopOffset: {x: 0, y: 0},
  },
};

export const OFFSETS_MOBILE: Record<NdwuScheduleEditorMode, ScheduleEditorOffset> = {
  [NDWU_SCHEDULE_EDITOR_MODE.THUMBNAIL]: {
    top: 30,
    left: 25,
    right: 25,
    bottom: 0,
    viewBoxShift: {x: 0, y: 0},
    blockText: {x: 0, y: 10},
    labelsLeftOffset: {x: -8, y: 4},
    labelsRightOffset: {x: 8, y: 4},
    labelsTopOffset: {x: 0, y: -10},
  },
  [NDWU_SCHEDULE_EDITOR_MODE.FULL]: {
    top: 30,
    left: 25,
    right: 25,
    bottom: 0,
    viewBoxShift: {x: 0, y: 0},
    blockText: {x: 0, y: 10},
    labelsLeftOffset: {x: -8, y: 4},
    labelsRightOffset: {x: 8, y: 4},
    labelsTopOffset: {x: 0, y: -10},
  },
};
