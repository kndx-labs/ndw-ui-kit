import {describe, expect, it} from 'vitest';
import {BUTTON_VARIANT, SIZE} from '@ndw-ui-kit/core';
import type {ButtonVariant, Size} from '@ndw-ui-kit/core';
import {mountButton} from '../helpers/mount';
import {isZeroLetterSpacing} from '../helpers/styles';

describe('button geometry', () => {
  it.each<[Size, string]>([
    [SIZE.S, '48px'],
    [SIZE.L, '64px'],
    [SIZE.XL, '96px'],
    [SIZE.XXL, '120px'],
  ])('BTN-LAY-03 — size %s has a minimum width of %s', (size, expected) => {
    const {styles} = mountButton({size});

    expect(styles().minWidth).toBe(expected);
  });

  it.each<[Size, string]>([
    [SIZE.S, '24px'],
    [SIZE.L, '32px'],
    [SIZE.XL, '44px'],
    [SIZE.XXL, '56px'],
  ])('BTN-LAY-04 — size %s has a fixed height of %s', (size, expected) => {
    const {styles} = mountButton({size});

    expect(styles().height).toBe(expected);
  });

  it('BTN-LAY-02 — resolves to XL when no size is set', () => {
    const {host, styles} = mountButton({size: undefined});

    expect(host.classList.contains('ndwu-button--XL')).toBe(true);
    expect(styles().height).toBe('44px');
  });

  it.each<[Size, string]>([
    [SIZE.S, '4px'],
    [SIZE.L, '6px'],
    [SIZE.XL, '8px'],
    [SIZE.XXL, '8px'],
  ])('BTN-SHP-01 — size %s has a border radius of %s', (size, expected) => {
    const {styles} = mountButton({size});

    expect(styles().borderTopLeftRadius).toBe(expected);
    expect(styles().borderBottomRightRadius).toBe(expected);
  });

  it.each<ButtonVariant>([
    BUTTON_VARIANT.PRIMARY,
    BUTTON_VARIANT.SECONDARY,
    BUTTON_VARIANT.TERTIARY,
    BUTTON_VARIANT.GHOST,
    BUTTON_VARIANT.SECONDARY_NEGATIVE,
  ])('BTN-SHP-02 — variant %s uses a 1px border', (variant) => {
    const {styles} = mountButton({variant});

    expect(styles().borderTopWidth).toBe('1px');
    expect(styles().borderRightWidth).toBe('1px');
    expect(styles().borderBottomWidth).toBe('1px');
    expect(styles().borderLeftWidth).toBe('1px');
  });

  it('BTN-TYP-01 — uses Roboto with the documented fallbacks', () => {
    const {styles} = mountButton();

    expect(styles().fontFamily).toBe('roboto, "Helvetica Neue", sans-serif');
  });

  it.each<Size>([SIZE.XL, SIZE.XXL])(
    'BTN-TYP-02 — size %s uses 16/24 with letter-spacing -0.1px',
    (size) => {
      const {styles} = mountButton({size});

      expect(styles().fontSize).toBe('16px');
      expect(styles().lineHeight).toBe('24px');
      expect(styles().letterSpacing).toBe('-0.1px');
    },
  );

  it.each<Size>([SIZE.S, SIZE.L])(
    'BTN-TYP-03 — size %s uses 12/17 with zero letter-spacing',
    (size) => {
      const {styles} = mountButton({size});

      expect(styles().fontSize).toBe('12px');
      expect(styles().lineHeight).toBe('17px');
      expect(isZeroLetterSpacing(styles().letterSpacing)).toBe(true);
    },
  );

  it('BTN-TYP-04 — the label does not wrap', () => {
    const {styles} = mountButton({label: 'A very long button label that would wrap'});

    expect(styles().whiteSpace).toBe('nowrap');
  });
});
