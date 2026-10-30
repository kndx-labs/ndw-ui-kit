import type {NdwuHeatStripCell} from './ndwu-heat-strip.types';
import {
  clampHeatStripIndex,
  findInvalidHeatStripLevels,
  heatStripLabelWithMarker,
  heatStripRovingTarget,
  normalizeHeatStripLevel,
  resolveHeatStripTooltipTarget,
} from './ndwu-heat-strip.helpers';

describe('normalizeHeatStripLevel', () => {
  it('keeps integers 0..5', () => {
    expect([0, 1, 2, 3, 4, 5].map(normalizeHeatStripLevel)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('maps null, fractions, negatives, NaN, Infinity, > 5 to null', () => {
    expect([null, 2.5, -1, Number.NaN, Infinity, 6, '3'].map(normalizeHeatStripLevel)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });
});

describe('findInvalidHeatStripLevels', () => {
  it('reports only non-null invalid levels', () => {
    const cells = [{level: 0}, {level: null}, {level: 2.5}, {level: 6}] as NdwuHeatStripCell[];

    expect(findInvalidHeatStripLevels(cells)).toEqual([2, 3]);
  });
});

describe('heatStripRovingTarget', () => {
  it('moves by arrows in LTR and swaps them in RTL', () => {
    expect(heatStripRovingTarget(2, 'ArrowRight', 5, false)).toBe(3);
    expect(heatStripRovingTarget(2, 'ArrowLeft', 5, false)).toBe(1);
    expect(heatStripRovingTarget(2, 'ArrowRight', 5, true)).toBe(1);
    expect(heatStripRovingTarget(2, 'ArrowLeft', 5, true)).toBe(3);
  });

  it('handles Home/End and stops at boundaries', () => {
    expect(heatStripRovingTarget(2, 'Home', 5, false)).toBe(0);
    expect(heatStripRovingTarget(2, 'End', 5, false)).toBe(4);
    expect(heatStripRovingTarget(4, 'ArrowRight', 5, false)).toBe(4);
    expect(heatStripRovingTarget(0, 'ArrowLeft', 5, false)).toBe(0);
  });

  it('ignores other keys', () => {
    expect(heatStripRovingTarget(2, 'ArrowUp', 5, false)).toBeNull();
  });
});

describe('clampHeatStripIndex', () => {
  it('clamps the remembered index to the current length', () => {
    expect(clampHeatStripIndex(1, 5)).toBe(1);
    expect(clampHeatStripIndex(4, 2)).toBe(1);
    expect(clampHeatStripIndex(3, 0)).toBe(0);
    expect(clampHeatStripIndex(-1, 5)).toBe(0);
  });
});

describe('resolveHeatStripTooltipTarget', () => {
  it('keeps a target inside the array', () => {
    expect(resolveHeatStripTooltipTarget(2, 5, false)).toBe(2);
  });

  it('drops the target past the end, while loading, or when absent', () => {
    expect(resolveHeatStripTooltipTarget(5, 5, false)).toBeNull();
    expect(resolveHeatStripTooltipTarget(-1, 5, false)).toBeNull();
    expect(resolveHeatStripTooltipTarget(2, 5, true)).toBeNull();
    expect(resolveHeatStripTooltipTarget(null, 5, false)).toBeNull();
  });
});

describe('heatStripLabelWithMarker', () => {
  it('appends marker text only for marked cells', () => {
    expect(heatStripLabelWithMarker('Level 2', true, 'Marked')).toBe('Level 2, Marked');
    expect(heatStripLabelWithMarker('Level 2', false, 'Marked')).toBe('Level 2');
  });
});
