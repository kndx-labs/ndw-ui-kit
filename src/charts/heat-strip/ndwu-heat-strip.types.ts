export const NDWU_HEAT_STRIP_LEVEL_COUNT = 6;

export type NdwuHeatStripLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface NdwuHeatStripCell<T = unknown> {
  level: NdwuHeatStripLevel | null;
  marker?: boolean;
  data?: T;
}

export type NdwuHeatStripCellLabel<T = unknown> = (
  cell: NdwuHeatStripCell<T>,
  index: number,
) => string;

export interface NdwuHeatStripTooltipContext<T = unknown> {
  $implicit: NdwuHeatStripCell<T>;
  index: number;
}

export type NdwuHeatStripMarkerContext<T = unknown> = NdwuHeatStripTooltipContext<T>;
