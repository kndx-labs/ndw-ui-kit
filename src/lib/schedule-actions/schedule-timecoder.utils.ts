import type {NdwuScheduleInterval, NdwuScheduleValue, NdwuWeekDay} from '@ndw-ui-kit/core/widgets';
import {NDWU_ANY_DAY} from './schedule-actions.constants';
import {
  DAY_NAME_TO_DOW,
  DOW_TO_DAY_NAME,
  MINUTES_IN_DAY,
  MINUTES_IN_HOUR,
  MINUTES_IN_WEEK,
} from './schedule-actions.internal';
import {NDWU_SCHEDULE_ACTION, type NdwuScheduleAction} from './schedule-actions.types';

type ScheduleActionList = Array<[number, number[]]>;

function findNearestStopFlag(stopFlags: number[], startFlag: number): number {
  const first = stopFlags[0];

  if (first === undefined) {
    return startFlag;
  }

  // An interval may run past the end of the week and continue at its beginning,
  // so a stop flag earlier than the start belongs to the next week and is
  // compared with a full week added to it.
  let result: number = first > startFlag ? first : first + MINUTES_IN_WEEK;

  stopFlags.forEach((flag) => {
    if (
      (flag > startFlag && flag < result)
      || (flag < startFlag && flag + MINUTES_IN_WEEK < result)
    ) {
      result = flag > startFlag ? flag : flag + MINUTES_IN_WEEK;
    }
  });

  return result;
}

function convertValueToIntervals(value: NdwuScheduleValue, weekDays: NdwuWeekDay[]): NdwuScheduleInterval[] {
  const intervals: NdwuScheduleInterval[] = [];

  weekDays.forEach((weekDay) => {
    const dayIntervals = value[weekDay.day];

    if (!dayIntervals) {
      return;
    }

    const shift = MINUTES_IN_DAY * DAY_NAME_TO_DOW[weekDay.day];

    dayIntervals.forEach(([dayStart, dayStop]) => {
      const start = shift + dayStart;
      const end = shift + dayStop;

      intervals.push([start, end > start ? end : end + MINUTES_IN_DAY]);
    });
  });

  return intervals;
}

function mergeIntervals(intervals: NdwuScheduleInterval[]): NdwuScheduleInterval[] {
  let hasUnmergedIntervals = true;

  while (hasUnmergedIntervals) {
    hasUnmergedIntervals = false;

    for (let i = 0, len = intervals.length; i < len; ++i) {
      const interval = intervals[i];

      if (!interval) {
        continue;
      }

      const toMergeWithIndex = intervals.findIndex((_interval: NdwuScheduleInterval) => {
        return interval[1] % MINUTES_IN_WEEK === _interval[0] % MINUTES_IN_WEEK;
      });

      if (toMergeWithIndex === -1) {
        continue;
      }

      const current = intervals[i];
      const toMerge = intervals[toMergeWithIndex];

      if (!current || !toMerge) {
        continue;
      }

      current[1] = toMerge[1];
      intervals.splice(toMergeWithIndex, 1);

      hasUnmergedIntervals = true;
    }
  }

  return intervals;
}

function appendNewAction(actionTime: number, actionsList: ScheduleActionList): ScheduleActionList {
  /* eslint-disable no-bitwise */
  let weekDay = actionTime / MINUTES_IN_DAY | 0;
  /* eslint-enable no-bitwise */
  let dayTime = actionTime - weekDay * MINUTES_IN_DAY;

  if (dayTime === MINUTES_IN_DAY) {
    weekDay++;
    dayTime = 0;
  }

  const index = actionsList.findIndex((action) => action[0] === dayTime);

  if (index === -1) {
    actionsList.push([dayTime, [weekDay]]);
  } else {
    const entry = actionsList[index];

    if (entry) {
      entry[1].push(weekDay);
    }
  }

  return actionsList;
}

function convertIntervalsToActionLists(
  intervals: NdwuScheduleInterval[],
): {startActions: ScheduleActionList; stopActions: ScheduleActionList} {
  return intervals.reduce(
    (acc, interval) => {
      const {startActions, stopActions} = acc;
      const [startTime, stopTime] = interval;

      return {
        startActions: appendNewAction(startTime, startActions),
        stopActions: appendNewAction(stopTime, stopActions),
      };
    },
    {
      startActions: [] as ScheduleActionList,
      stopActions: [] as ScheduleActionList,
    },
  );
}

function getNdmDayOfTheWeek(days: number[]): string {
  if (days.length === 7) {
    return NDWU_ANY_DAY;
  }

  return days
    .map((day) => day % 7)
    .sort((a, b) => a - b)
    .join(',');
}

export function actionsToValue(actions: NdwuScheduleAction[], weekDays: NdwuWeekDay[]): NdwuScheduleValue {
  const value: NdwuScheduleValue = {};

  weekDays.forEach((weekDay) => {
    value[weekDay.day] = [];
  });

  if (!actions?.length) {
    return value;
  }

  const startFlagsArray: number[] = [];
  const stopFlagsArray: number[] = [];

  actions.forEach((item) => {
    const isStart = item.action === NDWU_SCHEDULE_ACTION.START;
    const dayOffsetMinutes = Number(item.hour) * MINUTES_IN_HOUR + Number(item.min);

    const dows = item.dow === NDWU_ANY_DAY
      ? [0, 1, 2, 3, 4, 5, 6]
      : item.dow.split(',').map(Number);

    const minutes = dows.map((day) => (day * MINUTES_IN_DAY + dayOffsetMinutes) % MINUTES_IN_WEEK);

    if (isStart) {
      startFlagsArray.push(...minutes);
    } else {
      stopFlagsArray.push(...minutes);
    }
  });

  startFlagsArray.sort((a, b) => a - b);

  const linesArray: NdwuScheduleInterval[] = [];

  startFlagsArray.forEach((startFlag) => {
    linesArray.push([
      startFlag,
      findNearestStopFlag(stopFlagsArray, startFlag),
    ]);
  });

  linesArray.forEach((l) => {
    const startDay = Math.floor(l[0] / MINUTES_IN_DAY);
    const stopDay = Math.floor((l[1] - 1) / MINUTES_IN_DAY);

    for (let day = startDay; day <= stopDay; day++) {
      const start = l[0] < day * MINUTES_IN_DAY
        ? 0
        : l[0] % MINUTES_IN_DAY;

      const stop = l[1] > (day + 1) * MINUTES_IN_DAY
        ? MINUTES_IN_DAY
        : l[1] % MINUTES_IN_DAY || MINUTES_IN_DAY;

      const dayName = DOW_TO_DAY_NAME[day % 7];

      if (!dayName || !weekDays.some((weekDay) => weekDay.day === dayName)) {
        continue;
      }

      value[dayName]?.push([start, stop]);
    }
  });

  return value;
}

export function valueToActions(value: NdwuScheduleValue, weekDays: NdwuWeekDay[]): NdwuScheduleAction[] {
  if (!value) {
    return [];
  }

  const intervals = convertValueToIntervals(value, weekDays);
  const nonIntersectingIntervals = mergeIntervals(intervals);
  const {startActions, stopActions} = convertIntervalsToActionLists(nonIntersectingIntervals);

  const actionsArray: NdwuScheduleAction[] = [];

  [startActions, stopActions].forEach((actions, index) => {
    actions.forEach((action) => {
      const time = action[0];
      const days = action[1].sort((a, b) => a - b);

      actionsArray.push({
        action: index === 0 ? NDWU_SCHEDULE_ACTION.START : NDWU_SCHEDULE_ACTION.STOP,
        hour: String(Math.floor(time / MINUTES_IN_HOUR)),
        min: String(time % 60),
        dow: getNdmDayOfTheWeek(days),
      });
    });
  });

  return actionsArray;
}
