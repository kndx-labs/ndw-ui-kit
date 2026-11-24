import {InjectionToken, Provider} from '@angular/core';
import {NdwuSpritePathOptions, resolveSpritePath} from './sprite-path';

export interface NdwuPictogramSpriteConfig {
  path: string;
}

const createPictogramSpritePath = (basePath?: string): string => {
  return resolveSpritePath('ndw-ui-kit.pictogram.sprite.svg', basePath);
};

export const NDWU_PICTOGRAM_SPRITE_CONFIG = new InjectionToken<NdwuPictogramSpriteConfig>(
  'NDWU_PICTOGRAM_SPRITE_CONFIG',
  {
    factory: () => {
      return {path: createPictogramSpritePath()};
    },
  },
);

/**
 * Provide the kit pictogram sprite from a custom directory.
 *
 * @param options.basePath - Directory where the pictogram sprite is served. Defaults to `assets`.
 */
export const provideNdwuPictograms = (options?: NdwuSpritePathOptions): Provider => {
  return {
    provide: NDWU_PICTOGRAM_SPRITE_CONFIG,
    useValue: {path: createPictogramSpritePath(options?.basePath)} satisfies NdwuPictogramSpriteConfig,
  };
};
