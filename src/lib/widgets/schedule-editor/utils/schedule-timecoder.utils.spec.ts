import {describe, expect, it} from 'vitest';
import {NDWU_SCHEDULE_ACTION, type NdwuScheduleAction, NdwuScheduleBlock} from '../schedule-editor.types';
import {actionsToBlocks, blocksToActions} from './schedule-timecoder.utils';

const sortBlocks = (blocks: NdwuScheduleBlock[]): NdwuScheduleBlock[] => {
  return [...blocks].sort((a, b) => a.day - b.day || a.start - b.start);
};

const sortActions = (actions: NdwuScheduleAction[]): NdwuScheduleAction[] => {
  return [...actions].sort((a, b) =>
    a.action.localeCompare(b.action)
    || Number(a.hour) - Number(b.hour)
    || Number(a.min) - Number(b.min)
    || a.dow.localeCompare(b.dow)
  );
};

describe('blocksToActions', () => {
  it('emits a start and a stop action for a single block', () => {
    const blocks: NdwuScheduleBlock[] = [{day: 1, start: 60, stop: 120}];

    expect(sortActions(blocksToActions(blocks)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '1', min: '0', dow: '1'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '2', min: '0', dow: '1'},
      ]);
  });

  it('groups days that share the same time into one action', () => {
    const blocks: NdwuScheduleBlock[] = [
      {day: 1, start: 540, stop: 1020},
      {day: 2, start: 540, stop: 1020},
      {day: 3, start: 540, stop: 1020},
    ];

    expect(sortActions(blocksToActions(blocks)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '9', min: '0', dow: '1,2,3'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '17', min: '0', dow: '1,2,3'},
      ]);
  });

  it('collapses all seven days into the any-day marker', () => {
    const blocks: NdwuScheduleBlock[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({day, start: 540, stop: 600}));

    expect(sortActions(blocksToActions(blocks)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '9', min: '0', dow: '*'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '10', min: '0', dow: '*'},
      ]);
  });

  it('carries a block that wraps past midnight into the next day', () => {
    const blocks: NdwuScheduleBlock[] = [{day: 1, start: 1380, stop: 60}];

    expect(sortActions(blocksToActions(blocks)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '23', min: '0', dow: '1'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '1', min: '0', dow: '2'},
      ]);
  });

  it('wraps the end of the week back to day zero', () => {
    const blocks: NdwuScheduleBlock[] = [{day: 6, start: 1380, stop: 1440}];

    expect(sortActions(blocksToActions(blocks)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '23', min: '0', dow: '6'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '0', min: '0', dow: '0'},
      ]);
  });

  it('merges blocks that touch across a day boundary into one interval', () => {
    const blocks: NdwuScheduleBlock[] = [
      {day: 1, start: 1200, stop: 1440},
      {day: 2, start: 0, stop: 120},
    ];

    expect(sortActions(blocksToActions(blocks)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '20', min: '0', dow: '1'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '2', min: '0', dow: '2'},
      ]);
  });
});

describe('actionsToBlocks', () => {
  it('returns an empty array for no actions', () => {
    expect(actionsToBlocks([])).toEqual([]);
  });

  it('expands the any-day marker to every day of the week', () => {
    const actions: NdwuScheduleAction[] = [
      {action: NDWU_SCHEDULE_ACTION.START, hour: '9', min: '0', dow: '*'},
      {action: NDWU_SCHEDULE_ACTION.STOP, hour: '10', min: '0', dow: '*'},
    ];

    expect(sortBlocks(actionsToBlocks(actions)))
      .toEqual(
        [0, 1, 2, 3, 4, 5, 6].map((day) => ({day, start: 540, stop: 600})),
      );
  });

  it('splits an interval that crosses midnight into two day blocks', () => {
    const actions: NdwuScheduleAction[] = [
      {action: NDWU_SCHEDULE_ACTION.START, hour: '23', min: '0', dow: '1'},
      {action: NDWU_SCHEDULE_ACTION.STOP, hour: '1', min: '0', dow: '2'},
    ];

    expect(sortBlocks(actionsToBlocks(actions)))
      .toEqual([
        {day: 1, start: 1380, stop: 1440},
        {day: 2, start: 0, stop: 60},
      ]);
  });
});

describe('blocks to actions roundtrip', () => {
  it('restores the original blocks', () => {
    const blocks: NdwuScheduleBlock[] = [
      {day: 1, start: 540, stop: 1020},
      {day: 3, start: 540, stop: 1020},
      {day: 5, start: 0, stop: 120},
    ];

    expect(sortBlocks(actionsToBlocks(blocksToActions(blocks))))
      .toEqual(sortBlocks(blocks));
  });
});
