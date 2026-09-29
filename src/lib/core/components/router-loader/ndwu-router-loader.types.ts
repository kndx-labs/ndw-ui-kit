export type NdwuRouterLoaderSize = 'L' | 'XL';

export interface NdwuRouterLoaderGeometry {
  size: number;
  viewBox: string;
  shadowPath: string;
  shadowStrokeWidth: number;
  framePath: string;
  leftAntennaPath: string;
  rightAntennaPath: string;
  ledsY: number;
  ledsX: readonly [number, number, number];
  ledRadius: number;
}
