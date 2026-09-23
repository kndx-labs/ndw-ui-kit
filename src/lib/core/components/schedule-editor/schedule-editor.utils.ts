import {blocksToValue, valueToBlocks} from './layout/schedule-blocks.utils';
import {NdwuScheduleAction, NdwuScheduleValue, NdwuWeekDay} from './schedule-editor.types';
import {actionsToBlocks, blocksToActions} from './utils/schedule-timecoder.utils';

/* --------- Utility functions exported from the library ------------- */

export function actionsToScheduleValue(actions: NdwuScheduleAction[], weekDays: NdwuWeekDay[]): NdwuScheduleValue {
  return blocksToValue(actionsToBlocks(actions), weekDays);
}

export function scheduleValueToActions(value: NdwuScheduleValue, weekDays: NdwuWeekDay[]): NdwuScheduleAction[] {
  return blocksToActions(valueToBlocks(value, weekDays));
}
