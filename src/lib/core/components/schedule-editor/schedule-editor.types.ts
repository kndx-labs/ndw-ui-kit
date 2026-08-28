import {Values} from '../../../shared.types';

/* --------- Types exported from the library ------------- */

export enum SCHEDULE_ACTION {
  START = 'start',
  STOP = 'stop',
}

export interface ScheduleAction {
  action: SCHEDULE_ACTION;
  min: string;
  hour: string;
  dow: string;
}

export type ScheduleInterval = [number, number];

export type DayName =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

export interface WeekDay {
  day: DayName;
  label: string;
}

export const NDWU_SCHEDULE_EDITOR_MODE = {
  THUMBNAIL: 'thumbnail',
  FULL: 'full',
} as const;

export type NdwuScheduleEditorMode = Values<typeof NDWU_SCHEDULE_EDITOR_MODE>;

export const NDWU_SCHEDULE_EDITOR_LAYOUT = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
} as const;

export type NdwuScheduleEditorLayout = Values<typeof NDWU_SCHEDULE_EDITOR_LAYOUT>;

export const NDWU_SCHEDULE_EDITOR_SIZING = {
  FIXED: 'fixed',
  SCALE: 'scale',
  FILL: 'fill',
} as const;

export type NdwuScheduleEditorSizing = Values<typeof NDWU_SCHEDULE_EDITOR_SIZING>;

export type ScheduleValue = Partial<Record<DayName, ScheduleInterval[]>>;

export interface ScheduleTimePoint {
  gridTime: number;
  gridDay: number;
}

export interface ScheduleArea {
  startTime: number;
  endTime: number;
  startDay: number;
  endDay: number;
}

export interface ScheduleBlock {
  start: number;
  stop: number;
  day: number;
}
