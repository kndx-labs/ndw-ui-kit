import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {BUTTON_VARIANT} from '@ndw-ui-kit/core';
import {mountButton} from '../helpers/mount';
import {hexToRgb} from '../helpers/styles';

describe('button appearance', () => {
  it('BTN-CLR-01 — primary resolves its default background from the token set', () => {
    const {styles} = mountButton({variant: BUTTON_VARIANT.PRIMARY});

    expect(styles().backgroundColor).toBe(hexToRgb('#007bbe'));
    expect(styles().color).toBe(hexToRgb('#ffffff'));
  });

  it('BTN-CLR-01 — secondary resolves its default surface and border from the token set', () => {
    const {styles} = mountButton({variant: BUTTON_VARIANT.SECONDARY});

    expect(styles().backgroundColor).toBe(hexToRgb('#ffffff'));
    expect(styles().borderTopColor).toBe(hexToRgb('#58ace8'));
  });

  it('BTN-CLR-02 — disabled uses dedicated tokens rather than opacity', () => {
    const {styles} = mountButton({variant: BUTTON_VARIANT.PRIMARY, disabled: true});

    expect(styles().backgroundColor).toBe(hexToRgb('#797d89'));
    expect(styles().color).toBe(hexToRgb('#f0f2f4'));
    expect(styles().opacity).toBe('1');
  });

  it('BTN-ELV-03 — a resting button has no elevation', () => {
    const {styles} = mountButton();

    expect(styles().boxShadow).toBe('none');
    expect(styles().filter).toBe('none');
  });

  it('BTN-ELV-02 — keyboard focus renders the primary focus ring', async () => {
    const {host, styles} = mountButton({variant: BUTTON_VARIANT.PRIMARY});

    await userEvent.tab();

    expect(document.activeElement).toBe(host);

    // fx-focused-primary: focus colour at spread 3, plus white at spread 1.
    expect(styles().boxShadow).toContain(hexToRgb('#007bbe'));
    expect(styles().boxShadow).toContain('0px 0px 0px 3px');
    expect(styles().boxShadow).toContain('inset');
  });

  it('BTN-ELV-02 — keyboard focus renders the default focus ring on secondary', async () => {
    const {host, styles} = mountButton({variant: BUTTON_VARIANT.SECONDARY});

    await userEvent.tab();

    expect(document.activeElement).toBe(host);

    // fx-focused-default: focus colour at spread 2.
    expect(styles().boxShadow).toContain(hexToRgb('#007bbe'));
    expect(styles().boxShadow).toContain('0px 0px 0px 2px');
  });
});
