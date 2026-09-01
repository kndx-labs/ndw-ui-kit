import {describe, expect, it} from 'vitest';
import {mountSelect} from '../helpers/select';

describe('select behavior', () => {
  it('SEL-ELV-01 — opening the field renders the dropdown menu in an overlay', async () => {
    const sel = mountSelect();

    expect(sel.panel()).toBeNull();

    await sel.open();

    const panel = sel.panel();

    if (!panel) {
      throw new Error('SEL-ELV-01: no dropdown panel rendered');
    }

    // Desktop: an anchored panel that is bordered and rounded (not the mobile sheet).
    expect(panel.classList.contains('ndwu-dropdown-panel--sheet')).toBe(false);
    expect(getComputedStyle(panel).borderTopWidth).not.toBe('0px');
    expect(getComputedStyle(panel).borderTopLeftRadius).not.toBe('0px');
    expect(sel.options().length).toBe(2);
  });
});
