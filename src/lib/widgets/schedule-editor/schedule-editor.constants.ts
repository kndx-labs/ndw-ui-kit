import {NdwuDayName, NdwuWeekDay} from './schedule-editor.types';

/* --------- Constants exported from the library ------------- */

export const NDWU_DEFAULT_WEEK_DAYS: NdwuWeekDay[] = [
  {day: 'mon', label: 'Mon'},
  {day: 'tue', label: 'Tue'},
  {day: 'wed', label: 'Wed'},
  {day: 'thu', label: 'Thu'},
  {day: 'fri', label: 'Fri'},
  {day: 'sat', label: 'Sat'},
  {day: 'sun', label: 'Sun'},
];

export const NDWU_DAY_TO_NDM_DAY: Record<NdwuDayName, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

export const NDWU_NDM_DAY_TO_DAY: Record<number, NdwuDayName> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};
