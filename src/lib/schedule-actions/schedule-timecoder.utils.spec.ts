import {describe, expect, it} from 'vitest';
import type {NdwuDayName, NdwuScheduleValue, NdwuWeekDay} from '@ndw-ui-kit/core/widgets';
import {NDWU_SCHEDULE_ACTION, type NdwuScheduleAction} from './schedule-actions.types';
import {actionsToValue, valueToActions} from './schedule-timecoder.utils';

const WEEK_DAYS: NdwuWeekDay[] = (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as NdwuDayName[])
  .map((day) => ({day, label: day}));

const sortActions = (actions: NdwuScheduleAction[]): NdwuScheduleAction[] => {
  return [...actions].sort((a, b) =>
    a.action.localeCompare(b.action)
    || Number(a.hour) - Number(b.hour)
    || Number(a.min) - Number(b.min)
    || a.dow.localeCompare(b.dow)
  );
};

const emptyValue = (): NdwuScheduleValue => {
  return Object.fromEntries(WEEK_DAYS.map(({day}) => [day, []]));
};

describe('valueToActions', () => {
  it('emits a start and a stop action for a single day interval', () => {
    const value: NdwuScheduleValue = {mon: [[60, 120]]};

    expect(sortActions(valueToActions(value, WEEK_DAYS)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '1', min: '0', dow: '1'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '2', min: '0', dow: '1'},
      ]);
  });

  it('groups days that share the same time into one action', () => {
    const value: NdwuScheduleValue = {
      mon: [[540, 1020]],
      tue: [[540, 1020]],
      wed: [[540, 1020]],
    };

    expect(sortActions(valueToActions(value, WEEK_DAYS)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '9', min: '0', dow: '1,2,3'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '17', min: '0', dow: '1,2,3'},
      ]);
  });

  it('collapses all seven days into the any-day marker', () => {
    const value: NdwuScheduleValue = Object.fromEntries(WEEK_DAYS.map(({day}) => [day, [[540, 600]]]));

    expect(sortActions(valueToActions(value, WEEK_DAYS)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '9', min: '0', dow: '*'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '10', min: '0', dow: '*'},
      ]);
  });

  it('carries an interval that wraps past midnight into the next day', () => {
    const value: NdwuScheduleValue = {mon: [[1380, 60]]};

    expect(sortActions(valueToActions(value, WEEK_DAYS)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '23', min: '0', dow: '1'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '1', min: '0', dow: '2'},
      ]);
  });

  it('wraps the end of the week back to day zero', () => {
    const value: NdwuScheduleValue = {sat: [[1380, 1440]]};

    expect(sortActions(valueToActions(value, WEEK_DAYS)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '23', min: '0', dow: '6'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '0', min: '0', dow: '0'},
      ]);
  });

  it('merges intervals that touch across a day boundary into one interval', () => {
    const value: NdwuScheduleValue = {
      mon: [[1200, 1440]],
      tue: [[0, 120]],
    };

    expect(sortActions(valueToActions(value, WEEK_DAYS)))
      .toEqual([
        {action: NDWU_SCHEDULE_ACTION.START, hour: '20', min: '0', dow: '1'},
        {action: NDWU_SCHEDULE_ACTION.STOP, hour: '2', min: '0', dow: '2'},
      ]);
  });
});

describe('actionsToValue', () => {
  it('returns an empty array for no actions', () => {
    expect(actionsToValue([], WEEK_DAYS)).toEqual(emptyValue());
  });

  it('expands the any-day marker to every day of the week', () => {
    const actions: NdwuScheduleAction[] = [
      {action: NDWU_SCHEDULE_ACTION.START, hour: '9', min: '0', dow: '*'},
      {action: NDWU_SCHEDULE_ACTION.STOP, hour: '10', min: '0', dow: '*'},
    ];

    expect(actionsToValue(actions, WEEK_DAYS))
      .toEqual(
        Object.fromEntries(WEEK_DAYS.map(({day}) => [day, [[540, 600]]])),
      );
  });

  it('splits an interval that crosses midnight into two day intervals', () => {
    const actions: NdwuScheduleAction[] = [
      {action: NDWU_SCHEDULE_ACTION.START, hour: '23', min: '0', dow: '1'},
      {action: NDWU_SCHEDULE_ACTION.STOP, hour: '1', min: '0', dow: '2'},
    ];

    expect(actionsToValue(actions, WEEK_DAYS))
      .toEqual({
        ...emptyValue(),
        mon: [[1380, 1440]],
        tue: [[0, 60]],
      });
  });
});

describe('value to actions roundtrip', () => {
  it('restores the original value', () => {
    const value: NdwuScheduleValue = {
      mon: [[540, 1020]],
      wed: [[540, 1020]],
      fri: [[0, 120]],
    };

    expect(actionsToValue(valueToActions(value, WEEK_DAYS), WEEK_DAYS))
      .toEqual({...emptyValue(), ...value});
  });
});
