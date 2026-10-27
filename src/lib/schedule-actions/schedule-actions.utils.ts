import type {NdwuScheduleValue, NdwuWeekDay} from '@ndw-ui-kit/core/widgets';
import type {NdwuScheduleAction} from './schedule-actions.types';
import {actionsToValue, valueToActions} from './schedule-timecoder.utils';

export function ndwuActionsToScheduleValue(actions: NdwuScheduleAction[], weekDays: NdwuWeekDay[]): NdwuScheduleValue {
  return actionsToValue(actions, weekDays);
}

export function ndwuScheduleValueToActions(value: NdwuScheduleValue, weekDays: NdwuWeekDay[]): NdwuScheduleAction[] {
  return valueToActions(value, weekDays);
}
