import {describe, expect, it} from 'vitest';
import {mountSelect} from '../helpers/select';
import {hexToRgb} from '../helpers/styles';

describe('select appearance', () => {
  it('SEL-CLR-01 — trigger surface is the base white token (helper color is a divergence — see FINDINGS.md)', () => {
    const {triggerStyles} = mountSelect({hint: 'Helper'});

    expect(triggerStyles().backgroundColor).toBe(hexToRgb('#ffffff'));
  });

  it('SEL-SHP-01 — trigger uses the form control radius (8px at XL)', () => {
    const {triggerStyles} = mountSelect({size: 'XL'});

    expect(triggerStyles().borderTopLeftRadius).toBe('8px');
  });

  it.each<['XXL' | 'XL' | 'L', string]>([
    ['XXL', '56px'],
    ['XL', '44px'],
    ['L', '32px'],
  ])('SEL-LAY-01 — %s trigger height is %s', (size, height) => {
    const {triggerStyles} = mountSelect({size});

    expect(triggerStyles().height).toBe(height);
  });

  it('SEL-LAY-02 — XL is the default field size (44px)', () => {
    const {triggerStyles} = mountSelect();  // no size

    expect(triggerStyles().height).toBe('44px');
  });
});
