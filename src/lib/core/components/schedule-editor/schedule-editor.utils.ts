import {blocksToValue, valueToBlocks} from './layout/schedule-blocks.utils';
import {ScheduleAction, ScheduleValue, WeekDay} from './schedule-editor.types';
import {actionsToBlocks, blocksToActions} from './utils/schedule-timecoder.utils';

/* --------- Utility functions exported from the library ------------- */

export function actionsToScheduleValue(actions: ScheduleAction[], weekDays: WeekDay[]): ScheduleValue {
  return blocksToValue(actionsToBlocks(actions), weekDays);
}

export function scheduleValueToActions(value: ScheduleValue, weekDays: WeekDay[]): ScheduleAction[] {
  return blocksToActions(valueToBlocks(value, weekDays));
}
