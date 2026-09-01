import {Component} from '@angular/core';
import {describe, expect, it} from 'vitest';
import {openDrawer} from '../helpers/modal';
import {hexToRgb} from '../helpers/styles';

@Component({selector: 'drw-appearance-content', template: '<p>body</p>'})
class DrawerContentComponent {}

describe('drawer appearance', () => {
  it('DRW-CLR-01 — surface is the base white token', async () => {
    const {styles} = await openDrawer(DrawerContentComponent, {title: 'Title'});

    expect(styles().backgroundColor).toBe(hexToRgb('#ffffff'));  // global-color-gray-0
  });

  it('DRW-CLR-02 — footer primary button uses the primary button color', async () => {
    const {panel} = await openDrawer(DrawerContentComponent, {
      title: 'Title',
      buttons: [{label: 'OK', variant: 'primary'}],
    });
    const primary = panel.querySelector<HTMLButtonElement>('.ndwu-drawer__footer button');

    if (!primary) {
      throw new Error('DRW-CLR-02: no footer button rendered');
    }

    expect(getComputedStyle(primary).backgroundColor).toBe(hexToRgb('#007bbe'));
  });

  it('DRW-TYP-01 — default title is Roboto Medium 25 / line height 34', async () => {
    const {panel} = await openDrawer(DrawerContentComponent, {title: 'Title'});
    const title = panel.querySelector<HTMLElement>('.ndwu-drawer__title');

    if (!title) {
      throw new Error('DRW-TYP-01: no title rendered');
    }

    const style = getComputedStyle(title);

    expect(style.fontWeight).toBe('500');
    expect(style.fontSize).toBe('25px');
    expect(style.lineHeight).toBe('34px');
  });

  it('DRW-LAY-03 — default desktop width is XL 700px; XXL is 1200px', async () => {
    const xl = await openDrawer(DrawerContentComponent, {title: 'Title'});

    expect(xl.styles().width).toBe('700px');

    const xxl = await openDrawer(DrawerContentComponent, {title: 'Title', width: '1200px'});

    expect(xxl.panel.classList.contains('ndwu-drawer--xl')).toBe(true);
    expect(xxl.styles().width).toBe('1200px');
  });

  it('DRW-SHP-01 — header has a bottom border and footer a top border', async () => {
    const {panel} = await openDrawer(DrawerContentComponent, {
      title: 'Title',
      buttons: [{label: 'OK', variant: 'primary'}],
    });
    const header = panel.querySelector<HTMLElement>('.ndwu-drawer__header');
    const footer = panel.querySelector<HTMLElement>('.ndwu-drawer__footer');

    if (!header || !footer) {
      throw new Error('DRW-SHP-01: header/footer not rendered');
    }

    expect(getComputedStyle(header).borderBottomWidth).not.toBe('0px');
    expect(getComputedStyle(footer).borderTopWidth).not.toBe('0px');
  });

  it('DRW-ELV-01 — overlay shows a dimming backdrop and locks page scroll', async () => {
    await openDrawer(DrawerContentComponent, {title: 'Title'});

    const backdrop = document.querySelector<HTMLElement>('.ndwu-drawer-backdrop');

    if (!backdrop) {
      throw new Error('DRW-ELV-01: no backdrop rendered');
    }

    expect(getComputedStyle(backdrop).backgroundColor).toBe('rgba(0, 0, 0, 0.4)');
    expect(getComputedStyle(document.body).overflow).toBe('hidden');
  });
});
