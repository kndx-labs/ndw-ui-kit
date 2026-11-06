export type NdwuScrollbarAxis = 'x' | 'y';

export interface NdwuAxisElements {
  readonly track: HTMLElement;
  readonly thumb: HTMLElement;
}

export interface NdwuAxisMetrics {
  readonly contentSize: number;
  readonly clientSize: number;
  readonly scrollOffset: number;
  readonly trackSize: number;
}

export interface NdwuDragState {
  readonly axis: NdwuScrollbarAxis;
  readonly pointerId: number;
  readonly pointerOffset: number;
  readonly trackStart: number;
}
