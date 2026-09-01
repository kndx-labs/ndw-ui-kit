import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {openAlert} from '../helpers/modal';

describe('dialog accessibility', () => {
  it('DLG-ACC-01 — root has role=dialog, aria-modal=true, tabindex=-1', async () => {
    const {panel} = await openAlert({header: 'Title'});

    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('tabindex')).toBe('-1');
  });

  it('DLG-ACC-02 — aria-labelledby points at the default title id', async () => {
    const {panel} = await openAlert({header: 'Title', description: 'Body'});
    const labelledby = panel.getAttribute('aria-labelledby');
    const describedby = panel.getAttribute('aria-describedby');

    expect(labelledby).toBeTruthy();
    expect(panel.querySelector('.ndwu-dialog__title')?.id).toBe(labelledby);
    expect(describedby).toBeTruthy();
    expect(panel.querySelector('.ndwu-dialog__description')?.id).toBe(describedby);
  });

  it('DLG-ACC-03 — focus is captured on the heading and ESC closes the dialog', async () => {
    const {panel} = await openAlert({header: 'Title'});
    const title = panel.querySelector<HTMLElement>('.ndwu-dialog__title');

    if (!title) {
      throw new Error('DLG-ACC-03: no title rendered');
    }

    expect(document.activeElement).toBe(title);

    await userEvent.keyboard('{Escape}');

    expect(document.body.contains(panel)).toBe(false);
  });
});
