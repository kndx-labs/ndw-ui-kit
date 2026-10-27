import type {NdwuDayName, NdwuScheduleBlock, NdwuScheduleTimePoint, NdwuWeekDay} from '../schedule-editor.types';

export interface Offset {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
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
  start: NdwuScheduleTimePoint;
  end: NdwuScheduleTimePoint;
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
  anchor: Offset;
}

export interface TooltipView extends Offset {
  text: string;
}

export interface GetBlockRectsParams {
  isFull: boolean;
  offset: ScheduleEditorOffset;
  gridWidth: number;
  gridHeight: number;
  weekDays: NdwuWeekDay[];
  blocks: NdwuScheduleBlock[];
}

export interface GetSlotRectsParams {
  offset: ScheduleEditorOffset;
  gridWidth: number;
  gridHeight: number;
  weekDays: NdwuWeekDay[];
  blocks: NdwuScheduleBlock[];
}

export interface GetGridBlockParams {
  block: NdwuScheduleBlock;
  weekDays: NdwuWeekDay[];
  offset: ScheduleEditorOffset;
  gridWidth: number;
  gridHeight: number;
  text?: string[];
}

export interface GenerateBlockFromPointsParams {
  p1: NdwuScheduleTimePoint;
  p2: NdwuScheduleTimePoint;
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
  weekDays: NdwuWeekDay[];
  weekdayLabels: Partial<Record<NdwuDayName, string>>;
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
