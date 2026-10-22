import type {NdwuHeatStripCell} from './ndwu-heat-strip.types';
import {
  findInvalidHeatStripLevels,
  heatStripLabelWithMarker,
  heatStripRovingTarget,
  normalizeHeatStripLevel,
  resolveHeatStripKeyIndex,
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

describe('resolveHeatStripKeyIndex', () => {
  it('finds the key at its new position', () => {
    expect(resolveHeatStripKeyIndex('b', ['x', 'a', 'b'], 1)).toEqual({index: 2, found: true});
  });

  it('clamps the previous index when the key is gone', () => {
    expect(resolveHeatStripKeyIndex('z', ['a', 'b'], 5)).toEqual({index: 1, found: false});
    expect(resolveHeatStripKeyIndex('z', [], 0)).toEqual({index: -1, found: false});
  });

  it('takes the first match for duplicate keys', () => {
    expect(resolveHeatStripKeyIndex('a', ['x', 'a', 'a'], 2)).toEqual({index: 1, found: true});
  });
});

describe('heatStripLabelWithMarker', () => {
  it('appends marker text only for marked cells', () => {
    expect(heatStripLabelWithMarker('Level 2', true, 'Marked')).toBe('Level 2, Marked');
    expect(heatStripLabelWithMarker('Level 2', false, 'Marked')).toBe('Level 2');
  });
});
