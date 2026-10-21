import {describe, expect, it} from 'vitest';
import type {NdwuAxisMetrics} from './ndwu-scrollbar.types';
import {calculateThumbOffset, calculateThumbSize, convertTrackToScroll, hasOverflow} from './ndwu-scrollbar.geometry';

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

  it('uses the given minimum size', () => {
    expect(calculateThumbSize(metrics({contentSize: 10000}), 40)).toBe(40);
  });

  it('never exceeds a track shorter than the minimum size', () => {
    expect(calculateThumbSize(metrics({contentSize: 10000, trackSize: 16}), MIN_THUMB)).toBe(16);
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

  it('places the thumb end at the track end when a rounded-up scroll size keeps the scroll short of the maximum', () => {
    // real content height 363.5 is reported as 364, so the scroll stops at 209.5 instead of 210
    const rounded = metrics({contentSize: 364, clientSize: 154, scrollOffset: 209.5, trackSize: 178});

    expect(calculateThumbOffset(rounded, 75) + 75).toBe(178);
  });

  it('does not move the thumb to the track end 1px before the maximum scroll', () => {
    expect(calculateThumbOffset(metrics({scrollOffset: 199}), 100)).toBe(99);
  });

  it('places the thumb halfway at half scroll', () => {
    expect(calculateThumbOffset(metrics({scrollOffset: 100}), 100)).toBe(50);
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
});

describe('hasOverflow', () => {
  it('detects content larger than the viewport', () => {
    expect(hasOverflow(300, 200)).toBe(true);
  });

  it('ignores a 1px difference caused by rounding', () => {
    expect(hasOverflow(201, 200)).toBe(false);
  });
});
