import type {NdwuAxisMetrics} from './ndwu-scrollbar.types';

// scrollHeight/clientHeight are rounded to integers, so with fractional sizes they can be off
// by up to 1px: show an overflow that doesn't exist, or a maximum scroll offset the content
// never reaches
const ROUNDING_TOLERANCE = 1;
const WHEEL_LINE_HEIGHT = 16;

const WHEEL_DELTA_MODE_LINE = 1;
const WHEEL_DELTA_MODE_PAGE = 2;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function hasOverflow(contentSize: number, clientSize: number): boolean {
  return contentSize - clientSize > ROUNDING_TOLERANCE;
}

export function resolveWheelDelta(delta: number, deltaMode: number, pageSize: number): number {
  if (deltaMode === WHEEL_DELTA_MODE_LINE) {
    return delta * WHEEL_LINE_HEIGHT;
  }

  if (deltaMode === WHEEL_DELTA_MODE_PAGE) {
    return delta * pageSize;
  }

  return delta;
}

export function canScrollToward(metrics: NdwuAxisMetrics, delta: number): boolean {
  if (delta < 0) {
    return metrics.scrollOffset > 0;
  }

  const contentFree = metrics.contentSize - metrics.clientSize;

  return delta > 0 && contentFree - metrics.scrollOffset >= ROUNDING_TOLERANCE;
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

  // the scroll is at its real end, short of the rounded maximum
  if (contentFree - metrics.scrollOffset < ROUNDING_TOLERANCE) {
    return trackFree;
  }

  const offset = Math.floor((metrics.scrollOffset / contentFree) * trackFree);

  return clamp(offset, 0, trackFree);
}

// Converts a thumb start position on the track (counted from the track start) to the scroll
// offset at which the thumb starts there.
export function convertTrackToScroll(metrics: NdwuAxisMetrics, thumbSize: number, thumbStart: number): number {
  const trackFree = metrics.trackSize - thumbSize;
  const contentFree = metrics.contentSize - metrics.clientSize;

  if (trackFree <= 0 || contentFree <= 0) {
    return metrics.scrollOffset;
  }

  return clamp(thumbStart / trackFree, 0, 1) * contentFree;
}
