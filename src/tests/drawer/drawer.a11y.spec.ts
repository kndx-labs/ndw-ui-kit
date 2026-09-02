import {Component} from '@angular/core';
import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {must} from '../helpers/dom';
import {openDrawer} from '../helpers/modal';

@Component({selector: 'drw-a11y-content', template: '<p>body</p>'})
class DrawerContentComponent {}

describe('drawer accessibility', () => {
  it('DRW-ACC-01 — root has role=dialog, aria-modal=true, tabindex=-1', async () => {
    const {panel} = await openDrawer(DrawerContentComponent, {title: 'Title'});

    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('tabindex')).toBe('-1');
  });

  it('DRW-ACC-02 — aria-labelledby / aria-describedby point at the default title and description', async () => {
    const {panel} = await openDrawer(DrawerContentComponent, {title: 'Title', description: 'Body'});
    const labelledby = panel.getAttribute('aria-labelledby');
    const describedby = panel.getAttribute('aria-describedby');

    expect(labelledby).toBeTruthy();
    expect(panel.querySelector('.ndwu-drawer__title')?.id).toBe(labelledby);
    expect(describedby).toBeTruthy();
    expect(panel.querySelector('.ndwu-drawer__description')?.id).toBe(describedby);
  });

  it('DRW-ACC-03 — focus is captured on the heading and ESC closes the drawer', async () => {
    const {panel} = await openDrawer(DrawerContentComponent, {title: 'Title'});
    const title = must<HTMLElement>(panel, '.ndwu-drawer__title', 'DRW-ACC-03');

    expect(document.activeElement).toBe(title);

    await userEvent.keyboard('{Escape}');
    await new Promise((resolve) => setTimeout(resolve, 400));  // drawer animates out

    expect(document.body.contains(panel)).toBe(false);
  });
});
