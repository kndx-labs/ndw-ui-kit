import {NdwuValues} from '@ndw-ui-kit/core';

/* --------- Types exported from the library ------------- */

export enum NDWU_SCHEDULE_ACTION {
  START = 'start',
  STOP = 'stop',
}

export interface NdwuScheduleAction {
  action: NDWU_SCHEDULE_ACTION;
  min: string;
  hour: string;
  dow: string;
}

export type NdwuScheduleInterval = [number, number];

export type NdwuDayName =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

export interface NdwuWeekDay {
  day: NdwuDayName;
  label: string;
}

export const NDWU_SCHEDULE_EDITOR_MODE = {
  THUMBNAIL: 'thumbnail',
  FULL: 'full',
} as const;

export type NdwuScheduleEditorMode = NdwuValues<typeof NDWU_SCHEDULE_EDITOR_MODE>;

export const NDWU_SCHEDULE_EDITOR_LAYOUT = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
} as const;

export type NdwuScheduleEditorLayout = NdwuValues<typeof NDWU_SCHEDULE_EDITOR_LAYOUT>;

export const NDWU_SCHEDULE_EDITOR_SIZING = {
  FIXED: 'fixed',
  SCALE: 'scale',
  FILL: 'fill',
} as const;

export type NdwuScheduleEditorSizing = NdwuValues<typeof NDWU_SCHEDULE_EDITOR_SIZING>;

export type NdwuScheduleValue = Partial<Record<NdwuDayName, NdwuScheduleInterval[]>>;

export interface NdwuScheduleTimePoint {
  gridTime: number;
  gridDay: number;
}

export interface NdwuScheduleArea {
  startTime: number;
  endTime: number;
  startDay: number;
  endDay: number;
}

export interface NdwuScheduleBlock {
  start: number;
  stop: number;
  day: number;
}
