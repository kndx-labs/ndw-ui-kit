import {describe, expect, it} from 'vitest';
import {mountSelect} from '../helpers/select';

describe('select behavior', () => {
  it('SEL-ELV-01 — opening the field renders the dropdown menu in an overlay', async () => {
    const sel = mountSelect();

    expect(sel.panel()).toBeNull();

    await sel.open();

    const panel = sel.panel();

    expect(panel).not.toBeNull();
    expect(sel.options().length).toBe(2);
  });
});
