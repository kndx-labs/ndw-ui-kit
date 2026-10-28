export enum NDWU_SCHEDULE_ACTION {
  START = 'start',
  STOP = 'stop',
}

export interface NdwuScheduleAction {
  action: NDWU_SCHEDULE_ACTION;
  min: string;
  hour: string;
  dow: string;
}
