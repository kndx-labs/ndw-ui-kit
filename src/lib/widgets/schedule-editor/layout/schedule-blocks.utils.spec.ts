import {describe, expect, it} from 'vitest';
import type {NdwuScheduleBlock, NdwuScheduleInterval, NdwuScheduleValue} from '../schedule-editor.types';
import {NDWU_DEFAULT_WEEK_DAYS} from '../schedule-editor.constants';
import {
  blocksToValue,
  glueBlocks,
  minutesToTime,
  simplifyBlocks,
  subtractBlocks,
  subtractLines,
  valueToBlocks,
} from './schedule-blocks.utils';

const sortBlocks = (blocks: NdwuScheduleBlock[]): NdwuScheduleBlock[] =>
  [...blocks].sort((a, b) => a.day - b.day || a.start - b.start);

describe('minutesToTime', () => {
  it('pads hours and minutes to two digits', () => {
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(9 * 60 + 5)).toBe('09:05');
    expect(minutesToTime(23 * 60 + 30)).toBe('23:30');
  });
});

describe('subtractLines', () => {
  it('keeps a disjoint line untouched', () => {
    const lines: NdwuScheduleInterval[] = [[0, 60]];

    expect(subtractLines(lines, [120, 180])).toEqual([[0, 60]]);
  });

  it('drops a line fully contained in the removed one', () => {
    const lines: NdwuScheduleInterval[] = [[60, 120]];

    expect(subtractLines(lines, [0, 180])).toEqual([]);
  });

  it('splits a line that contains the removed one', () => {
    const lines: NdwuScheduleInterval[] = [[0, 180]];

    expect(subtractLines(lines, [60, 120])).toEqual([[0, 60], [120, 180]]);
  });

  it('trims a line overlapping the start of the removed one', () => {
    const lines: NdwuScheduleInterval[] = [[0, 120]];

    expect(subtractLines(lines, [60, 180])).toEqual([[0, 60]]);
  });

  it('trims a line overlapping the end of the removed one', () => {
    const lines: NdwuScheduleInterval[] = [[60, 180]];

    expect(subtractLines(lines, [0, 120])).toEqual([[120, 180]]);
  });

  it('applies the removal to every line in the list', () => {
    const lines: NdwuScheduleInterval[] = [[0, 60], [120, 240], [300, 360]];

    expect(subtractLines(lines, [180, 330]))
      .toEqual([[0, 60], [120, 180], [330, 360]]);
  });
});

describe('subtractBlocks', () => {
  it('subtracts a single interval from a day', () => {
    const source: NdwuScheduleBlock[] = [{day: 1, start: 0, stop: 600}];
    const removed: NdwuScheduleBlock[] = [{day: 1, start: 120, stop: 240}];

    expect(sortBlocks(subtractBlocks(source, removed)))
      .toEqual([
        {day: 1, start: 0, stop: 120},
        {day: 1, start: 240, stop: 600},
      ]);
  });

  it('accumulates several removing intervals on the same day', () => {
    const source: NdwuScheduleBlock[] = [{day: 1, start: 0, stop: 600}];
    const removed: NdwuScheduleBlock[] = [
      {day: 1, start: 60, stop: 120},
      {day: 1, start: 300, stop: 360},
    ];

    expect(sortBlocks(subtractBlocks(source, removed)))
      .toEqual([
        {day: 1, start: 0, stop: 60},
        {day: 1, start: 120, stop: 300},
        {day: 1, start: 360, stop: 600},
      ]);
  });

  it('leaves days without a removing interval untouched', () => {
    const source: NdwuScheduleBlock[] = [
      {day: 1, start: 0, stop: 600},
      {day: 2, start: 0, stop: 600},
    ];
    const removed: NdwuScheduleBlock[] = [{day: 1, start: 0, stop: 600}];

    expect(sortBlocks(subtractBlocks(source, removed)))
      .toEqual([
        {day: 2, start: 0, stop: 600},
      ]);
  });
});

describe('glueBlocks', () => {
  it('returns the input when there is nothing to merge', () => {
    expect(glueBlocks([])).toEqual([]);
    expect(glueBlocks([[0, 60]])).toEqual([[0, 60]]);
  });

  it('merges overlapping and adjacent intervals, sorting by start', () => {
    const intervals: NdwuScheduleInterval[] = [[120, 180], [0, 60], [60, 90]];

    expect(glueBlocks(intervals)).toEqual([[0, 90], [120, 180]]);
  });

  it('keeps intervals separated by a gap', () => {
    const intervals: NdwuScheduleInterval[] = [[0, 60], [120, 180]];

    expect(glueBlocks(intervals)).toEqual([[0, 60], [120, 180]]);
  });

  it('absorbs an interval nested in the previous one', () => {
    const intervals: NdwuScheduleInterval[] = [[0, 240], [60, 120]];

    expect(glueBlocks(intervals)).toEqual([[0, 240]]);
  });
});

describe('simplifyBlocks', () => {
  it('returns an empty array for empty input', () => {
    expect(simplifyBlocks([])).toEqual([]);
  });

  it('drops zero-length blocks', () => {
    const blocks: NdwuScheduleBlock[] = [
      {day: 1, start: 60, stop: 60},
      {day: 1, start: 120, stop: 180},
    ];

    expect(simplifyBlocks(blocks))
      .toEqual([{day: 1, start: 120, stop: 180}]);
  });

  it('merges adjacent blocks within a day but not across days', () => {
    const blocks: NdwuScheduleBlock[] = [
      {day: 1, start: 60, stop: 120},
      {day: 1, start: 120, stop: 180},
      {day: 2, start: 60, stop: 120},
    ];

    expect(sortBlocks(simplifyBlocks(blocks)))
      .toEqual([
        {day: 1, start: 60, stop: 180},
        {day: 2, start: 60, stop: 120},
      ]);
  });
});

describe('valueToBlocks and blocksToValue', () => {
  it('returns no blocks for an empty value', () => {
    expect(valueToBlocks(null, NDWU_DEFAULT_WEEK_DAYS)).toEqual([]);
    expect(valueToBlocks(undefined, NDWU_DEFAULT_WEEK_DAYS)).toEqual([]);
    expect(valueToBlocks({}, NDWU_DEFAULT_WEEK_DAYS)).toEqual([]);
  });

  it('maps day names to ndm day indices', () => {
    const value: NdwuScheduleValue = {mon: [[60, 120]], sun: [[0, 30]]};

    expect(sortBlocks(valueToBlocks(value, NDWU_DEFAULT_WEEK_DAYS)))
      .toEqual([
        {day: 0, start: 0, stop: 30},
        {day: 1, start: 60, stop: 120},
      ]);
  });

  it('ignores days that are not in the week days list', () => {
    const value: NdwuScheduleValue = {mon: [[60, 120]], sat: [[0, 30]]};

    expect(valueToBlocks(value, [{day: 'mon', label: 'Mon'}]))
      .toEqual([
        {day: 1, start: 60, stop: 120},
      ]);
  });

  it('roundtrips a value through blocks and back', () => {
    const value: NdwuScheduleValue = {
      mon: [[60, 120]],
      wed: [[0, 30], [600, 720]],
      sun: [[180, 240]],
    };

    const roundtripped = blocksToValue(valueToBlocks(value, NDWU_DEFAULT_WEEK_DAYS), NDWU_DEFAULT_WEEK_DAYS);

    expect(roundtripped)
      .toEqual({
        mon: [[60, 120]],
        tue: [],
        wed: [[0, 30], [600, 720]],
        thu: [],
        fri: [],
        sat: [],
        sun: [[180, 240]],
      });
  });
});
