const PIXEL_OR_PERCENT_LENGTH = /^(?:\d+(?:\.\d+)?|\.\d+)(?:px|%)$/;

export function tooltipScrollPaddingToRootMarginPart(value: string): string {
  if (!PIXEL_OR_PERCENT_LENGTH.test(value) || value === '0px') {
    return '0px';
  }

  return `-${value}`;
}

export function getScrollPaddingRootMargin(): string {
  const scrollingElement = document.scrollingElement ?? document.documentElement;
  const computedStyle = window.getComputedStyle(scrollingElement);
  const top = tooltipScrollPaddingToRootMarginPart(computedStyle.scrollPaddingTop);
  const right = tooltipScrollPaddingToRootMarginPart(computedStyle.scrollPaddingRight);
  const bottom = tooltipScrollPaddingToRootMarginPart(computedStyle.scrollPaddingBottom);
  const left = tooltipScrollPaddingToRootMarginPart(computedStyle.scrollPaddingLeft);

  return `${top} ${right} ${bottom} ${left}`;
}
