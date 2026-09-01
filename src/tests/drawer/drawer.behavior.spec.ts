import {Component} from '@angular/core';
import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {openDrawer} from '../helpers/modal';

@Component({selector: 'drw-behavior-content', template: '<p>body</p>'})
class DrawerContentComponent {}

const flushClose = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 400));

describe('drawer behavior', () => {
  it('DRW-BHV-01 — backdrop click closes; disableClose blocks ESC', async () => {
    const closeable = await openDrawer(DrawerContentComponent, {title: 'T'});

    document.querySelector<HTMLElement>('.ndwu-drawer-backdrop')?.click();
    await flushClose();

    expect(document.body.contains(closeable.panel)).toBe(false);

    const locked = await openDrawer(DrawerContentComponent, {title: 'T', disableClose: true});

    await userEvent.keyboard('{Escape}');
    await flushClose();

    expect(document.body.contains(locked.panel)).toBe(true);
  });

  it('DRW-BHV-03 — a drawer with no buttons renders no footer', async () => {
    const {panel} = await openDrawer(DrawerContentComponent, {title: 'T'});

    expect(panel.querySelector('.ndwu-drawer__footer')).toBeNull();
  });

  it('DRW-LAY-01 — primary is the last footer child (footer right-align is a divergence — see FINDINGS.md)', async () => {
    const {panel} = await openDrawer(DrawerContentComponent, {
      title: 'T',
      buttons: [{label: 'Cancel', variant: 'secondary'}, {label: 'OK', variant: 'primary'}],
    });
    const buttons = panel.querySelectorAll('.ndwu-drawer__footer button');

    expect(buttons.length).toBe(2);
    expect(buttons[buttons.length - 1]?.textContent).toContain('OK');
  });
});
