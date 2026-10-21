import {describe, expect, it} from 'vitest';
import {
  DEFAULT_MIN_THUMB_SIZE,
  type NdwuBoxStyle,
  clearContentBoxSize,
  measureContentBox,
  measureTrackSize,
  parseMinThumbSize,
  syncContentBoxSize,
} from './ndwu-scrollbar.dom';

const boxStyle = (overrides: Partial<NdwuBoxStyle> = {}): NdwuBoxStyle => {
  return {
    width: '200px',
    height: '100px',
    boxSizing: 'content-box',
    paddingTop: '0px',
    paddingRight: '0px',
    paddingBottom: '0px',
    paddingLeft: '0px',
    borderTopWidth: '0px',
    borderRightWidth: '0px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    ...overrides,
  };
};

describe('measureContentBox', () => {
  it('returns the size as is for content-box sizing', () => {
    expect(measureContentBox(boxStyle({width: '200.5px', paddingLeft: '10px'})))
      .toEqual({width: 200.5, height: 100});
  });

  it('subtracts padding and border for border-box sizing', () => {
    const style = boxStyle({
      boxSizing: 'border-box',
      paddingLeft: '4px',
      paddingRight: '6px',
      borderLeftWidth: '1px',
      borderRightWidth: '1px',
      paddingTop: '2px',
      paddingBottom: '3px',
      borderTopWidth: '1px',
      borderBottomWidth: '1.5px',
    });

    expect(measureContentBox(style)).toEqual({width: 188, height: 92.5});
  });

  it('treats empty padding and border values as zero', () => {
    const style = boxStyle({boxSizing: 'border-box', paddingLeft: '', borderTopWidth: ''});

    expect(measureContentBox(style)).toEqual({width: 200, height: 100});
  });

  it('returns null when the width is not a number', () => {
    expect(measureContentBox(boxStyle({width: 'auto'}))).toBeNull();
  });

  it('returns null when the height is not a number', () => {
    expect(measureContentBox(boxStyle({height: ''}))).toBeNull();
  });
});

describe('measureTrackSize', () => {
  it('reads the height of a vertical track, keeping fractions', () => {
    expect(measureTrackSize({width: '8px', height: '731.5px'}, 'height')).toBe(731.5);
  });

  it('reads the width of a horizontal track', () => {
    expect(measureTrackSize({width: '320px', height: '8px'}, 'width')).toBe(320);
  });

  it('returns 0 when the size is not a number', () => {
    expect(measureTrackSize({width: 'auto', height: ''}, 'height')).toBe(0);
  });
});

describe('parseMinThumbSize', () => {
  it('reads a pixel value', () => {
    expect(parseMinThumbSize('32px')).toBe(32);
  });

  it('ignores surrounding whitespace', () => {
    expect(parseMinThumbSize(' 16.5px ')).toBe(16.5);
  });

  it('accepts unitless zero', () => {
    expect(parseMinThumbSize('0')).toBe(0);
  });

  it('falls back to the default for an empty value', () => {
    expect(parseMinThumbSize('')).toBe(DEFAULT_MIN_THUMB_SIZE);
  });

  it('falls back to the default for non-pixel units', () => {
    expect(parseMinThumbSize('2rem')).toBe(DEFAULT_MIN_THUMB_SIZE);
  });

  it('falls back to the default for invalid values', () => {
    expect(parseMinThumbSize('auto')).toBe(DEFAULT_MIN_THUMB_SIZE);
    expect(parseMinThumbSize('-4px')).toBe(DEFAULT_MIN_THUMB_SIZE);
  });
});

describe('content box size', () => {
  const createElements = () => {
    const host = document.createElement('div');
    const content = document.createElement('div');

    host.append(content);
    document.body.append(host);

    return {host, content};
  };

  it('sets the host content box size on the content as inline size', () => {
    const {host, content} = createElements();

    host.style.width = '120px';
    host.style.height = '80px';

    syncContentBoxSize(content, host);

    expect(content.style.width).toBe('120px');
    expect(content.style.height).toBe('80px');

    host.remove();
  });

  it('removes the previous inline size when the host size cannot be measured', () => {
    const {host, content} = createElements();

    content.style.width = '120px';
    content.style.height = '80px';
    host.style.width = 'auto';

    syncContentBoxSize(content, host);

    expect(content.style.width).toBe('');
    expect(content.style.height).toBe('');

    host.remove();
  });

  it('clears the inline size', () => {
    const {host, content} = createElements();

    content.style.width = '120px';
    content.style.height = '80px';

    clearContentBoxSize(content);

    expect(content.style.width).toBe('');
    expect(content.style.height).toBe('');

    host.remove();
  });
});
