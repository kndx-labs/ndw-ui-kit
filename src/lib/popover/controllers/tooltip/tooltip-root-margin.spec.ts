import {tooltipScrollPaddingToRootMarginPart} from './tooltip-root-margin';

describe('tooltip scroll-padding rootMargin conversion', () => {
  it.each([
    {value: '64px', expected: '-64px'},
    {value: '0px', expected: '0px'},
    {value: '10%', expected: '-10%'},
    {value: 'auto', expected: '0px'},
    {value: '', expected: '0px'},
    {value: 'calc(10px + 1em)', expected: '0px'},
    {value: '2em', expected: '0px'},
  ])('converts "$value" to "$expected"', ({value, expected}) => {
    expect(tooltipScrollPaddingToRootMarginPart(value)).toBe(expected);
  });
});
