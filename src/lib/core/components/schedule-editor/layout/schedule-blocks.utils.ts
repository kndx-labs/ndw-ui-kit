import {ScheduleBlock, type ScheduleInterval, ScheduleValue, type WeekDay} from '../schedule-editor.types';
import {DAY_TO_NDM_DAY, NDM_DAY_TO_DAY} from '../schedule-editor.constants';
import {DAYS_IN_WEEK, MINUTES_IN_HOUR} from '../ndwu-schedule-editor.constants';

export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / MINUTES_IN_HOUR);
  const m = minutes - h * MINUTES_IN_HOUR;

  return `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}`;
};

export const minutesToHourShort = (minutes: number): string => {
  const h = Math.floor(minutes / MINUTES_IN_HOUR);

  return h < 10 ? `0${h}` : String(h);
};

export const valueToBlocks = (value: ScheduleValue | null | undefined, weekDays: WeekDay[]): ScheduleBlock[] => {
  if (!value) {
    return [];
  }

  const blocks: ScheduleBlock[] = [];

  weekDays.forEach((weekDay) => {
    const intervals = value[weekDay.day];

    if (!intervals) {
      return;
    }

    intervals.forEach(([start, stop]) => {
      blocks.push({day: DAY_TO_NDM_DAY[weekDay.day], start, stop});
    });
  });

  return blocks;
};

export const blocksToValue = (blocks: ScheduleBlock[], weekDays: WeekDay[]): ScheduleValue => {
  const value: ScheduleValue = {};

  weekDays.forEach((weekDay) => {
    value[weekDay.day] = [];
  });

  blocks.forEach((block) => {
    const day = NDM_DAY_TO_DAY[block.day];

    if (!day) {
      return;
    }

    const weekDay = weekDays.find((wd) => wd.day === day);

    if (!weekDay) {
      return;
    }

    const scheduleForDay = value[weekDay.day];

    if (!scheduleForDay) {
      return;
    }

    scheduleForDay.push([block.start, block.stop]);
  });

  return value;
};

const blocksToLines = (blocks: ScheduleBlock[]): ScheduleInterval[][] => {
  const lines: ScheduleInterval[][] = new Array<ScheduleInterval[]>(DAYS_IN_WEEK)
    .fill(null as unknown as ScheduleInterval[])
    .map(() => []);

  blocks.forEach((b) => {
    const {start, stop, day} = b;
    const key = Number(day);
    const dayLines = lines[key];

    if (dayLines) {
      dayLines.push([start, stop]);
    }
  });

  return lines;
};

export const subtractLines = (lines: ScheduleInterval[], line: ScheduleInterval): ScheduleInterval[] => {
  const newArr: ScheduleInterval[] = [];

  for (const fromLine of lines) {
    if (fromLine[0] >= line[0] && fromLine[1] <= line[1]) {
      continue;
    }

    if (fromLine[0] < line[0] && fromLine[1] > line[1]) {
      newArr.push([fromLine[0], line[0]]);
      newArr.push([line[1], fromLine[1]]);
      continue;
    }

    const isOverlappingStart = fromLine[0] < line[0] && fromLine[1] <= line[1] && fromLine[1] >= line[0];

    if (isOverlappingStart) {
      newArr.push([fromLine[0], line[0]]);
      continue;
    }

    const isOverlappingEnd = fromLine[0] >= line[0] && line[1] < fromLine[1] && fromLine[0] <= line[1];

    if (isOverlappingEnd) {
      newArr.push([line[1], fromLine[1]]);
      continue;
    }

    newArr.push(fromLine);
  }

  return newArr;
};

export function subtractBlocks(sourceArray: ScheduleBlock[], blocks: ScheduleBlock[]): ScheduleBlock[] {
  const days1 = blocksToLines(sourceArray);
  const days2 = blocksToLines(blocks);
  const subtractedArr: ScheduleBlock[] = [];

  Object.keys(days1)
    .map(Number)
    .forEach((day) => {
      const sourceLines = days1[day];
      const removingLines = days2[day];

      if (!sourceLines || !removingLines) {
        return;
      }

      // Each removing interval is applied to the result of the previous one,
      // not to the original day lines.
      days1[day] = removingLines.reduce(
        (lines, line) => subtractLines(lines, line),
        sourceLines,
      );
    });

  Object.keys(days1)
    .map(Number)
    .forEach((day) => {
      const dayLines = days1[day];

      if (!dayLines) {
        return;
      }

      dayLines.forEach((line) => {
        const [start, stop] = line;

        subtractedArr.push({start, stop, day});
      });
    });

  return subtractedArr;
}

export function glueBlocks(arr: ScheduleInterval[]): ScheduleInterval[] {
  if (arr.length <= 1) {
    return arr;
  }

  const sorted = [...arr].sort((a, b) => a[0] - b[0]);
  const result: ScheduleInterval[] = sorted[0] ? [sorted[0]] : [];

  for (let i = 1; i < sorted.length; i++) {
    const last = result.at(-1);
    const curr = sorted[i];

    if (!last || !curr) {
      continue;
    }

    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      result.push(curr);
    }
  }

  return result;
}

export function simplifyBlocks(blocks: ScheduleBlock[]): ScheduleBlock[] {
  if (blocks.length === 0) {
    return [];
  }

  const result: ScheduleBlock[] = [];
  const linesInfo = blocksToLines(blocks);

  linesInfo.forEach((info, line) => {
    glueBlocks(info).forEach((b) => {
      const [start, stop] = b;

      if (Math.abs(start - stop) > 0) {
        result.push({start, stop, day: Number(line)});
      }
    });
  });

  return result;
}
