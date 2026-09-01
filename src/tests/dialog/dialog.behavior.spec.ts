import {Component} from '@angular/core';
import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {openDialog} from '../helpers/modal';

@Component({selector: 'dlg-behavior-content', template: '<p>body</p>'})
class DialogContentComponent {}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

describe('dialog behavior', () => {
  it('DLG-BHV-01 — backdrop click closes; disableClose blocks ESC', async () => {
    const closeable = await openDialog(DialogContentComponent, {title: 'T'});

    document.querySelector<HTMLElement>('.ndwu-modal-backdrop')?.click();
    await flush();

    expect(document.body.contains(closeable.panel)).toBe(false);

    const locked = await openDialog(DialogContentComponent, {title: 'T', disableClose: true});

    await userEvent.keyboard('{Escape}');
    await flush();

    expect(document.body.contains(locked.panel)).toBe(true);
  });

  it('DLG-BHV-03 — a dialog with no buttons renders no footer', async () => {
    const {panel} = await openDialog(DialogContentComponent, {title: 'T'});

    expect(panel.querySelector('.ndwu-dialog__footer')).toBeNull();
  });

  it('DLG-LAY-01 — primary is the last footer child (footer right-align is a divergence — see FINDINGS.md)', async () => {
    const {panel} = await openDialog(DialogContentComponent, {
      title: 'T',
      buttons: [{label: 'Cancel', variant: 'secondary'}, {label: 'OK', variant: 'primary'}],
    });
    const buttons = panel.querySelectorAll('.ndwu-dialog__footer button');

    expect(buttons.length).toBe(2);
    expect(buttons[buttons.length - 1]?.textContent).toContain('OK');
  });
});
