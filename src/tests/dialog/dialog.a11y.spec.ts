import {describe, expect, it} from 'vitest';
import {openAlert} from '../helpers/modal';

describe('dialog harness smoke', () => {
  it('opens an alert dialog with role=dialog', async () => {
    const {panel} = await openAlert({header: 'Hello'});

    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
  });
});
