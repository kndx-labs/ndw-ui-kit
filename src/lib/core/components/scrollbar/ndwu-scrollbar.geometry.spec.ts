import {describe, expect, it} from 'vitest';
import type {NdwuAxisMetrics} from './ndwu-scrollbar.types';
import {
  DEFAULT_MIN_THUMB_SIZE,
  calculateThumbOffset,
  calculateThumbSize,
  convertTrackToScroll,
  hasOverflow,
  parseMinThumbSize,
} from './ndwu-scrollbar.geometry';

const MIN_THUMB = 24;

const metrics = (overrides: Partial<NdwuAxisMetrics> = {}): NdwuAxisMetrics => {
  return {
    contentSize: 400,
    clientSize: 200,
    scrollOffset: 0,
    trackSize: 200,
    ...overrides,
  };
};

describe('calculateThumbSize', () => {
  it('scales the thumb by the visible part of the content', () => {
    expect(calculateThumbSize(metrics(), MIN_THUMB)).toBe(100);
  });

  it('scales the thumb against the track, not the viewport, when the track is inset', () => {
    expect(calculateThumbSize(metrics({trackSize: 192}), MIN_THUMB)).toBe(96);
  });

  it('keeps the thumb at the minimum size for long content', () => {
    expect(calculateThumbSize(metrics({contentSize: 10000}), MIN_THUMB)).toBe(MIN_THUMB);
  });

  it('uses the given minimum size', () => {
    expect(calculateThumbSize(metrics({contentSize: 10000}), 40)).toBe(40);
  });

  it('never exceeds a track shorter than the minimum size', () => {
    expect(calculateThumbSize(metrics({contentSize: 10000, trackSize: 16}), MIN_THUMB)).toBe(16);
  });

  it('never exceeds the track when the content fits', () => {
    expect(calculateThumbSize(metrics({contentSize: 100}), MIN_THUMB)).toBe(200);
  });

  it('returns 0 for a zero-size track', () => {
    expect(calculateThumbSize(metrics({trackSize: 0}), MIN_THUMB)).toBe(0);
  });

  it('returns 0 for zero-size content', () => {
    expect(calculateThumbSize(metrics({contentSize: 0}), MIN_THUMB)).toBe(0);
  });
});

describe('calculateThumbOffset', () => {
  it('places the thumb at the track start without scroll', () => {
    expect(calculateThumbOffset(metrics(), 100)).toBe(0);
  });

  it('places the thumb end at the end of an inset track at maximum scroll', () => {
    const inset = metrics({scrollOffset: 200, trackSize: 192});
    const thumbSize = calculateThumbSize(inset, MIN_THUMB);

    expect(calculateThumbOffset(inset, thumbSize) + thumbSize).toBe(192);
  });

  it('places the thumb end at the end of a track shortened by the other axis at maximum scroll', () => {
    // the vertical track is shorter by the horizontal track and its padding
    const shortened = metrics({scrollOffset: 200, trackSize: 190});
    const thumbSize = calculateThumbSize(shortened, MIN_THUMB);

    expect(calculateThumbOffset(shortened, thumbSize) + thumbSize).toBe(190);
  });

  it('places the thumb halfway at half scroll', () => {
    expect(calculateThumbOffset(metrics({scrollOffset: 100}), 100)).toBe(50);
  });

  it('keeps the thumb inside the track when the scroll offset overshoots', () => {
    expect(calculateThumbOffset(metrics({scrollOffset: 201}), 100)).toBe(100);
  });

  it('returns 0 when the content fits', () => {
    expect(calculateThumbOffset(metrics({contentSize: 200, scrollOffset: 10}), 100)).toBe(0);
  });

  it('returns 0 when the thumb fills the track', () => {
    expect(calculateThumbOffset(metrics({scrollOffset: 100, trackSize: 16}), 16)).toBe(0);
  });
});

describe('convertTrackToScroll', () => {
  it('maps the track start to zero scroll', () => {
    expect(convertTrackToScroll(metrics(), 100, 0)).toBe(0);
  });

  it('maps the end of the free track to maximum scroll', () => {
    expect(convertTrackToScroll(metrics({trackSize: 192}), 96, 96)).toBe(200);
  });

  it('clamps positions outside the track', () => {
    expect(convertTrackToScroll(metrics(), 100, -50)).toBe(0);
    expect(convertTrackToScroll(metrics(), 100, 500)).toBe(200);
  });

  it('centers the thumb on the position when asked', () => {
    expect(convertTrackToScroll(metrics(), 100, 100, {centerOnThumb: true})).toBe(100);
  });

  it('is the inverse of calculateThumbOffset', () => {
    const scrolled = metrics({scrollOffset: 120, trackSize: 190});
    const thumbSize = calculateThumbSize(scrolled, MIN_THUMB);
    const offset = calculateThumbOffset(scrolled, thumbSize);

    expect(convertTrackToScroll(scrolled, thumbSize, offset)).toBeCloseTo(120, 0);
  });

  it('keeps the current scroll offset when the thumb fills the track', () => {
    expect(convertTrackToScroll(metrics({scrollOffset: 30, trackSize: 16}), 16, 8)).toBe(30);
  });

  it('keeps the current scroll offset when the content fits', () => {
    expect(convertTrackToScroll(metrics({contentSize: 200, scrollOffset: 0}), 100, 50)).toBe(0);
  });
});

describe('hasOverflow', () => {
  it('detects content larger than the viewport', () => {
    expect(hasOverflow(300, 200)).toBe(true);
  });

  it('ignores a 1px difference caused by rounding', () => {
    expect(hasOverflow(201, 200)).toBe(false);
  });

  it('reports no overflow for content that fits', () => {
    expect(hasOverflow(200, 200)).toBe(false);
  });
});

describe('parseMinThumbSize', () => {
  it('reads a pixel value', () => {
    expect(parseMinThumbSize('32px')).toBe(32);
  });

  it('ignores surrounding whitespace', () => {
    expect(parseMinThumbSize(' 16.5px ')).toBe(16.5);
  });

  it('accepts unitless zero', () => {
    expect(parseMinThumbSize('0')).toBe(0);
  });

  it('falls back to the default for an empty value', () => {
    expect(parseMinThumbSize('')).toBe(DEFAULT_MIN_THUMB_SIZE);
  });

  it('falls back to the default for non-pixel units', () => {
    expect(parseMinThumbSize('2rem')).toBe(DEFAULT_MIN_THUMB_SIZE);
  });

  it('falls back to the default for invalid values', () => {
    expect(parseMinThumbSize('auto')).toBe(DEFAULT_MIN_THUMB_SIZE);
    expect(parseMinThumbSize('-4px')).toBe(DEFAULT_MIN_THUMB_SIZE);
  });
});
