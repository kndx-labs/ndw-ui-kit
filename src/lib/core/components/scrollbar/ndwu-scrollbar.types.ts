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
    readonly thumbStyle: 'height';
    readonly translateAxis: (v: number) => string;
  }
  | {
    readonly contentSize: 'scrollWidth';
    readonly clientSize: 'clientWidth';
    readonly scrollOffset: 'scrollLeft';
    readonly pointerCoord: 'clientX';
    readonly rectStart: 'left';
    readonly thumbStyle: 'width';
    readonly translateAxis: (v: number) => string;
  };

// CSS lengths; unset sides keep the defaults from the SCSS. Use `0px`, not `0`: the values are
// summed in calc(), where a unitless 0 drops the declaration.
export interface NdwuScrollbarPadding {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
}
