// Used when --ndwu-scrollbar-min-thumb-size is not set or is not a px value
export const DEFAULT_MIN_THUMB_SIZE = 24;

const PX_VALUE_PATTERN = /^(\d+(?:\.\d+)?)px$/;

export interface NdwuBoxSize {
  readonly width: number;
  readonly height: number;
}

type BoxSizeProp =
  | 'width'
  | 'height'
  | 'boxSizing'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'borderTopWidth'
  | 'borderRightWidth'
  | 'borderBottomWidth'
  | 'borderLeftWidth';

export type NdwuBoxStyle = Pick<CSSStyleDeclaration, BoxSizeProp>;

const sumPx = (...values: string[]): number => {
  return values.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
};

// Takes a computed style, not an element: `getComputedStyle` keeps fractional pixels
// (`clientWidth`/`clientHeight` round them) and is not affected by transforms (`getBoundingClientRect`
// is), so open/close animations don't skew it.
export function measureContentBox(style: NdwuBoxStyle): NdwuBoxSize | null {
  const width = parseFloat(style.width);
  const height = parseFloat(style.height);

  if (Number.isNaN(width) || Number.isNaN(height)) {
    return null;
  }

  if (style.boxSizing !== 'border-box') {
    return {width, height};
  }

  return {
    width: width - sumPx(style.paddingLeft, style.paddingRight, style.borderLeftWidth, style.borderRightWidth),
    height: height - sumPx(style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth),
  };
}

// Measure the track itself, not the host: the track is shorter by its padding and, when both
// tracks are visible, by the other track. A computed style keeps fractional pixels
// (clientWidth/clientHeight round them up, which puts the thumb end past the track end).
export function measureTrackSize(
  style: Pick<CSSStyleDeclaration, 'width' | 'height'>,
  property: 'width' | 'height',
): number {
  const size = parseFloat(style[property]);

  return Number.isNaN(size) ? 0 : size;
}

// Accepts only px values and unitless 0: other units (rem, em) can't be converted to px from
// the raw variable value.
export function parseMinThumbSize(value: string): number {
  const trimmed = value.trim();

  if (trimmed === '0') {
    return 0;
  }

  const match = PX_VALUE_PATTERN.exec(trimmed);

  return match?.[1] === undefined ? DEFAULT_MIN_THUMB_SIZE : Number(match[1]);
}

export function clearContentBoxSize(content: HTMLElement): void {
  content.style.width = '';
  content.style.height = '';
}

// The content box gets the host size as inline width/height, which makes it the element that
// scrolls. A host sized by its content (e.g. a dialog body with `height: auto`) would then
// keep its first size forever. So: remove the inline size, let the host take its natural
// size (within its max-height etc.), and set the inline size again. A host sized from
// outside just measures the same.
export function syncContentBoxSize(content: HTMLElement, host: HTMLElement): void {
  const {scrollTop, scrollLeft} = content;

  clearContentBoxSize(content);

  const hostSize = measureContentBox(getComputedStyle(host));

  if (hostSize !== null) {
    content.style.width = `${hostSize.width}px`;
    content.style.height = `${hostSize.height}px`;
  }

  // without the inline size there is nothing to scroll, so the browser has reset the scroll
  // position; restore it
  content.scrollTop = scrollTop;
  content.scrollLeft = scrollLeft;
}
