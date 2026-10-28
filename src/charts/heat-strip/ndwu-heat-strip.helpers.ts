import type {NdwuHeatStripCell, NdwuHeatStripLevel} from './ndwu-heat-strip.types';

export function normalizeHeatStripLevel(level: unknown): NdwuHeatStripLevel | null {
  if (typeof level === 'number' && Number.isInteger(level) && level >= 0 && level <= 5) {
    return level as NdwuHeatStripLevel;
  }

  return null;
}

export function findInvalidHeatStripLevels(cells: readonly NdwuHeatStripCell[]): number[] {
  const invalidIndexes: number[] = [];

  cells.forEach((cell, index) => {
    if (cell.level !== null && normalizeHeatStripLevel(cell.level) === null) {
      invalidIndexes.push(index);
    }
  });

  return invalidIndexes;
}

export function heatStripRovingTarget(
  current: number,
  key: string,
  length: number,
  rtl: boolean,
): number | null {
  if (length <= 0) {
    return null;
  }

  switch (key) {
    case 'Home':
      return 0;
    case 'End':
      return length - 1;
    case 'ArrowRight': {
      const delta = rtl ? -1 : 1;

      return Math.min(Math.max(current + delta, 0), length - 1);
    }
    case 'ArrowLeft': {
      const delta = rtl ? 1 : -1;

      return Math.min(Math.max(current + delta, 0), length - 1);
    }
    default:
      return null;
  }
}

export function clampHeatStripIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0));
}

export function resolveHeatStripTooltipTarget(
  index: number | null,
  length: number,
  loading: boolean,
): number | null {
  if (loading || index === null || index < 0 || index >= length) {
    return null;
  }

  return index;
}

export function heatStripLabelWithMarker(base: string, marker: boolean, markerText: string): string {
  if (marker) {
    return `${base}, ${markerText}`;
  }

  return base;
}
