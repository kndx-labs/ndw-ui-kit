import type {NdwuAxisMetrics} from './ndwu-scrollbar.types';

// Used when --ndwu-scrollbar-min-thumb-size is not set or is not a px value
export const DEFAULT_MIN_THUMB_SIZE = 24;

// scrollHeight/clientHeight are rounded to integers, so with fractional sizes they can show
// a 1px overflow that doesn't exist
const OVERFLOW_ROUNDING_TOLERANCE = 1;

const PX_VALUE_PATTERN = /^(\d+(?:\.\d+)?)px$/;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function hasOverflow(contentSize: number, clientSize: number): boolean {
  return contentSize - clientSize > OVERFLOW_ROUNDING_TOLERANCE;
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

// The thumb is never longer than the track, even if the track is shorter than the minimum.
export function calculateThumbSize(metrics: NdwuAxisMetrics, minThumbSize: number): number {
  if (metrics.contentSize <= 0 || metrics.trackSize <= 0) {
    return 0;
  }

  const ratio = metrics.clientSize / metrics.contentSize;
  const proportionalSize = Math.floor(ratio * metrics.trackSize);

  return Math.min(metrics.trackSize, Math.max(proportionalSize, minThumbSize));
}

export function calculateThumbOffset(metrics: NdwuAxisMetrics, thumbSize: number): number {
  const trackFree = metrics.trackSize - thumbSize;
  const contentFree = metrics.contentSize - metrics.clientSize;

  if (trackFree <= 0 || contentFree <= 0) {
    return 0;
  }

  const offset = Math.floor((metrics.scrollOffset / contentFree) * trackFree);

  return clamp(offset, 0, trackFree);
}

// Converts a position on the track (counted from the track start) to the scroll offset at
// which the thumb starts there, or is centered there with `centerOnThumb`.
export function convertTrackToScroll(
  metrics: NdwuAxisMetrics,
  thumbSize: number,
  trackPosition: number,
  options: {centerOnThumb?: boolean} = {},
): number {
  const trackFree = metrics.trackSize - thumbSize;
  const contentFree = metrics.contentSize - metrics.clientSize;

  if (trackFree <= 0 || contentFree <= 0) {
    return metrics.scrollOffset;
  }

  const thumbStart = options.centerOnThumb
    ? trackPosition - (thumbSize / 2)
    : trackPosition;

  return clamp(thumbStart / trackFree, 0, 1) * contentFree;
}
