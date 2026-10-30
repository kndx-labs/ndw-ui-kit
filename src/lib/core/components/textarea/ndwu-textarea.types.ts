import type {NdwuSize} from '../../../shared.types';

export type NdwuTextareaResizeDirection = 'vertical' | 'horizontal' | 'both';

export interface NdwuTextareaResizeConfiguration {
  size: NdwuSize;
  resizable: boolean;
  resizeDirection: NdwuTextareaResizeDirection;
}

export interface NdwuTextareaResizeStart {
  pointerX: number;
  pointerY: number;
  width: number;
  height: number;
  minWidth: number | null;
  horizontalActivated: boolean;
  pointerId: number;
  captureTarget: HTMLElement;
  configuration: NdwuTextareaResizeConfiguration;
}
