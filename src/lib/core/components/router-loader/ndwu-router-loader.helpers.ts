import {NdwuRouterLoaderGeometry, NdwuRouterLoaderSize} from './ndwu-router-loader.types';

export const ROUTER_LOADER_SIZE_FALLBACK: NdwuRouterLoaderSize = 'XL';

export const ROUTER_LOADER_DURATION_FALLBACK = 1500; // ms, matches the design

// Non-numeric and non-positive values fall back to the design duration instead of stopping the animation
export const coerceRouterLoaderDuration = (value: unknown): number => {
  const duration = Number(value);

  return Number.isFinite(duration) && duration > 0 ? duration : ROUTER_LOADER_DURATION_FALLBACK;
};

export const coerceRouterLoaderSize = (value: unknown): NdwuRouterLoaderSize => {
  return value === 'L' || value === 'XL' ? value : ROUTER_LOADER_SIZE_FALLBACK;
};

// Geometry of `router_loader_sync_2_4px_L_64` / `router_loader_sync_2_4px_XL_100` from the design
export const ROUTER_LOADER_GEOMETRY: Record<NdwuRouterLoaderSize, NdwuRouterLoaderGeometry> = {
  L: {
    size: 64,
    shadowPath:
      'M14.308 34C24.769 34 35.231 34 45.692 34C48.071 34 50 35.927 50 38.305C50 41.435 50 44.565 50 47.695C50 50.073 48.071 52 45.692 52C35.231 52 24.769 52 14.308 52C11.929 52 10 50.073 10 47.695C10 44.565 10 41.435 10 38.305C10 35.927 11.929 34 14.308 34Z',
    shadowStrokeWidth: 3.584,
    framePath:
      'M15.524 29C26.508 29 37.492 29 48.476 29C50.975 29 53 31.034 53 33.544C53 36.848 53 40.152 53 43.456C53 45.966 50.975 48 48.476 48C37.492 48 26.508 48 15.524 48C13.025 48 11 45.966 11 43.456C11 40.152 11 36.848 11 33.544C11 31.034 13.025 29 15.524 29Z',
    leftAntennaPath: 'M6 9V33',
    rightAntennaPath: 'M58 9V33',
    ledsY: 38.588,
    ledsX: [25.412, 32, 38.588],
    ledRadius: 1.412,
  },
  XL: {
    size: 100,
    shadowPath:
      'M21.897 53C38.632 53 55.368 53 72.103 53C75.912 53 79 55.999 79 59.698C79 64.566 79 69.434 79 74.302C79 78.001 75.912 81 72.103 81C55.368 81 38.632 81 21.897 81C18.088 81 15 78.001 15 74.302C15 69.434 15 64.566 15 59.698C15 55.999 18.088 53 21.897 53Z',
    shadowStrokeWidth: 5.6,
    framePath:
      'M24.897 46C41.632 46 58.368 46 75.103 46C78.912 46 82 48.999 82 52.698C82 57.566 82 62.434 82 67.302C82 71.001 78.912 74 75.103 74C58.368 74 41.632 74 24.897 74C21.088 74 18 71.001 18 67.302C18 62.434 18 57.566 18 52.698C18 48.999 21.088 46 24.897 46Z',
    leftAntennaPath: 'M10 16V52',
    rightAntennaPath: 'M90 16V52',
    ledsY: 60,
    ledsX: [39.706, 50, 60.294],
    ledRadius: 2.206,
  },
};
