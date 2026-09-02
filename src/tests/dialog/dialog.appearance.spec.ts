import {Component} from '@angular/core';
import {describe, expect, it} from 'vitest';
import {must} from '../helpers/dom';
import {openAlert, openDialog} from '../helpers/modal';
import {hexToRgb} from '../helpers/styles';

@Component({selector: 'dlg-appearance-content', template: '<p>body</p>'})
class DialogContentComponent {}

describe('dialog appearance', () => {
  it('DLG-CLR-01 — surface is the base white token', async () => {
    const {styles} = await openAlert({header: 'Title'});

    expect(styles().backgroundColor).toBe(hexToRgb('#ffffff'));  // global-color-gray-0
  });

  it('DLG-CLR-02 — footer primary button uses the primary button color', async () => {
    const {panel} = await openDialog(DialogContentComponent, {
      title: 'Title',
      buttons: [{label: 'OK', variant: 'primary'}],
    });
    const primary = must<HTMLButtonElement>(panel, '.ndwu-dialog__footer button', 'DLG-CLR-02');

    expect(getComputedStyle(primary).backgroundColor).toBe(hexToRgb('#007bbe'));
  });

  it('DLG-TYP-01 — default title is Roboto Medium 25 / line height 34', async () => {
    const {panel} = await openAlert({header: 'Title'});
    const title = must<HTMLElement>(panel, '.ndwu-dialog__title', 'DLG-TYP-01');
    const style = getComputedStyle(title);

    expect(style.fontWeight).toBe('500');
    expect(style.fontSize).toBe('25px');
    expect(style.lineHeight).toBe('34px');
  });

  it('DLG-SHP-01 — radius is a fixed 8px (divergence: spec says per-size 8/12/16, default 12 — see FINDINGS.md)', async () => {
    const {styles} = await openAlert({header: 'Title'});

    // Impl pins radius-L on every dialog; XL/XXL are unreachable (no size-set API).
    expect(styles().borderTopLeftRadius).toBe('8px');
  });

  it('DLG-ELV-01 — overlay shows a dimming backdrop and locks page scroll', async () => {
    await openAlert({header: 'Title'});

    const backdrop = must<HTMLElement>(document, '.ndwu-modal-backdrop', 'DLG-ELV-01');

    expect(getComputedStyle(backdrop).backgroundColor).toBe('rgba(0, 0, 0, 0.4)');
    expect(getComputedStyle(document.body).overflow).toBe('hidden');
  });
});
