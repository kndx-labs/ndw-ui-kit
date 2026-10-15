import type {NdwuDayName} from '@ndw-ui-kit/core/widgets';

export const MINUTES_IN_HOUR = 60;
export const MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR;
export const MINUTES_IN_WEEK = MINUTES_IN_DAY * 7;

export const DAY_NAME_TO_DOW: Record<NdwuDayName, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export const DOW_TO_DAY_NAME: Record<number, NdwuDayName> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};
