import type {DayName, ScheduleBlock, ScheduleTimePoint, WeekDay} from '../schedule-editor.types';

export interface Offset {
  x: number;
  y: number;
}

export interface ScheduleEditorOffset {
  top: number;
  left: number;
  right: number;
  bottom: number;
  viewBoxShift?: Offset;
  blockText?: Offset;
  labelsLeftOffset?: Offset;
  labelsRightOffset?: Offset;
  labelsTopOffset?: Offset;
}

export interface ScheduleEditorCanvasSize {
  width: number;
  height: number;
}

export interface GridLine {
  id: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  classes: string;
  dasharray?: string;
}

export interface SlotRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dayIndex: number;
  slotIndex: number;
  selected: boolean;
  cssClass: string;
}

export type SlotRectPosition = Pick<SlotRect, 'x' | 'y' | 'width' | 'height'>;

export interface BlockRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  texts: string[];
  textPositions: Array<{x: number; y: number; anchor: string}>;
}

export interface AxisLabel {
  id: string;
  x: number;
  y: number;
  text: string;
  anchor: string;
  alignment: string;
  cssClass: string;
}

export interface DragState {
  start: ScheduleTimePoint;
  end: ScheduleTimePoint;
  removing: boolean;
}

export interface ScheduleGridBlock {
  x: number;
  y: number;
  height: number;
  width: number;
  text?: string[];
}

export interface DragPreview {
  rect: ScheduleGridBlock;
  cssClass: string;
}

export interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export interface GetBlockRectsParams {
  isFull: boolean;
  offset: ScheduleEditorOffset;
  gridWidth: number;
  gridHeight: number;
  weekDays: WeekDay[];
  blocks: ScheduleBlock[];
}

export interface GetSlotRectsParams {
  offset: ScheduleEditorOffset;
  gridWidth: number;
  gridHeight: number;
  weekDays: WeekDay[];
  blocks: ScheduleBlock[];
}

export interface GetGridBlockParams {
  block: ScheduleBlock;
  weekDays: WeekDay[];
  offset: ScheduleEditorOffset;
  gridWidth: number;
  gridHeight: number;
  text?: string[];
}

export interface GenerateBlockFromPointsParams {
  p1: ScheduleTimePoint;
  p2: ScheduleTimePoint;
  offset: ScheduleEditorOffset;
  gridWidth: number;
  gridHeight: number;
  canvasWidth: number;
}

export interface CoordsToTimeSlotParams {
  svgPoint: {x: number; y: number};
  offset: ScheduleEditorOffset;
  canvasWidth: number;
  gridWidth: number;
  gridHeight: number;
}

export interface GetAxesTextParams {
  isFullMode: boolean;
  weekDays: WeekDay[];
  weekdayLabels: Partial<Record<DayName, string>>;
  offset: ScheduleEditorOffset;
  gridWidth: number;
  gridHeight: number;
}

export interface GetGridLinesParams {
  isFull: boolean;
  offset: ScheduleEditorOffset;
  gridWidth: number;
  gridHeight: number;
}

export interface SlotRectPositionParams {
  offset: ScheduleEditorOffset;
  dayIndex: number;
  slotIndex: number;
  hourCellSize: number;
  dayCellSize: number;
}

export interface BlockTextPositionParams {
  gridBlock: ScheduleGridBlock | null;
  hourCellSize: number;
  dayCellSize: number;
  blockTextX: number;
  blockTextY: number;
}
