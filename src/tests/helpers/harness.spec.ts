import {describe, expect, it} from 'vitest';
import {SIZE} from '@ndw-ui-kit/core';
import {mountButton} from './mount';
import {hexToRgb, isZeroLetterSpacing} from './styles';

describe('test harness', () => {
  it('mounts a button attached to the document', () => {
    const {host} = mountButton({label: 'Save'});

    expect(document.body.contains(host)).toBe(true);
    expect(host.tagName).toBe('BUTTON');
    expect(host.textContent).toContain('Save');
  });

  it('applies inputs and runs change detection', () => {
    const {host, styles} = mountButton({size: SIZE.S});

    expect(host.classList).toContain('ndwu-button--S');
    expect(styles().height).toBe('24px');
  });

  it('re-renders on update()', () => {
    const {styles, update} = mountButton({size: SIZE.S});

    update({size: SIZE.XXL});

    expect(styles().height).toBe('56px');
  });

  it('converts hex to the browser rgb format', () => {
    expect(hexToRgb('#007bbe')).toBe('rgb(0, 123, 190)');
    expect(hexToRgb('#fff')).toBe('rgb(255, 255, 255)');
  });

  it('treats normal and 0px as zero letter-spacing', () => {
    expect(isZeroLetterSpacing('normal')).toBe(true);
    expect(isZeroLetterSpacing('0px')).toBe(true);
    expect(isZeroLetterSpacing('-0.1px')).toBe(false);
  });
});
