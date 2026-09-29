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

export type NdwuAxisConfigEntry =
  | {
    readonly contentSize: 'scrollHeight';
    readonly clientSize: 'clientHeight';
    readonly scrollOffset: 'scrollTop';
    readonly pointerCoord: 'clientY';
    readonly rectStart: 'top';
    readonly trackSize: 'clientHeight';
    readonly thumbStyle: 'height';
    readonly translateAxis: (v: number) => string;
    readonly overflowSignal: 'isOverflowingY';
  }
  | {
    readonly contentSize: 'scrollWidth';
    readonly clientSize: 'clientWidth';
    readonly scrollOffset: 'scrollLeft';
    readonly pointerCoord: 'clientX';
    readonly rectStart: 'left';
    readonly trackSize: 'clientWidth';
    readonly thumbStyle: 'width';
    readonly translateAxis: (v: number) => string;
    readonly overflowSignal: 'isOverflowingX';
  };

export interface NdwuScrollbarPadding {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
}
