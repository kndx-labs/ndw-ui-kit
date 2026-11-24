import {InjectionToken, Provider} from '@angular/core';
import {NDWU_BASE_ICON_NAMES, NDWU_EXTRA_ICON_NAME, NDWU_ICON_NAME, NdwuIconName} from '../../icon-names';
import {NdwuSpritePathOptions, createCoreSpritePath, resolveSpritePath} from './sprite-path';

export interface NdwuIconSpriteSource {
  path: string;
  iconNames: readonly NdwuIconName[];
}

export interface NdwuIconSpriteConfig {
  sources: readonly NdwuIconSpriteSource[];
  fallbackIconName: NdwuIconName;
}

const createCoreSpriteSource = (basePath?: string): NdwuIconSpriteSource => {
  return {
    path: createCoreSpritePath(basePath),
    iconNames: NDWU_BASE_ICON_NAMES,
  };
};

const createExtraSpriteSource = (basePath?: string): NdwuIconSpriteSource => {
  return {
    path: resolveSpritePath('ndw-ui-kit.extra.sprite.svg', basePath),
    iconNames: Object.values(NDWU_EXTRA_ICON_NAME),
  };
};

export const NDWU_ICON_SPRITE_CONFIG = new InjectionToken<NdwuIconSpriteConfig>(
  'NDWU_ICON_SPRITE_CONFIG',
  {
    factory: () => {
      return {
        sources: [createCoreSpriteSource()],
        fallbackIconName: NDWU_ICON_NAME.WARNING_S,
      };
    },
  },
);

/**
 * Provide core and extra icon sprites.
 *
 * These icon providers set the same token; use only one of them.
 *
 * @param options.basePath - Directory where the kit sprite files are served. Defaults to `assets`.
 */
export const provideNdwuAllIcons = (options?: NdwuSpritePathOptions): Provider => {
  return {
    provide: NDWU_ICON_SPRITE_CONFIG,
    useValue: {
      sources: [createCoreSpriteSource(options?.basePath), createExtraSpriteSource(options?.basePath)],
      fallbackIconName: NDWU_ICON_NAME.WARNING_S,
    } satisfies NdwuIconSpriteConfig,
  };
};

/**
 * Provide a custom subset sprite alongside the core sprite.
 *
 * Use this when your app relies on only a subset of the extra icons and you
 * have generated a custom sprite with the `ndw-ui-kit-build-sprite` CLI.
 *
 * These icon providers set the same token; use only one of them.
 *
 * @example
 * ```ts
 * import {provideNdwuCustomIcons} from '@ndw-ui-kit/core';
 * import {icons} from './my-icons.config';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideNdwuCustomIcons({
 *       path: 'assets/my-custom.sprite.svg',
 *       iconNames: icons,
 *     }),
 *   ],
 * });
 * ```
 *
 * @param config.path       - URL/path to the custom sprite SVG file served by your app.
 * @param config.iconNames  - The icon names included in the custom sprite.
 *                            Accepts `readonly NdwuIconName[]` so you can pass the typed array
 *                            exported by your config file directly.
 * @param config.basePath   - Directory where the kit core sprite is served. Defaults to `assets`.
 */
export const provideNdwuCustomIcons = (config: {
  path: string;
  iconNames: readonly NdwuIconName[];
  basePath?: string;
}): Provider => {
  const customSource: NdwuIconSpriteSource = {path: config.path, iconNames: config.iconNames};

  return {
    provide: NDWU_ICON_SPRITE_CONFIG,
    useValue: {
      sources: [createCoreSpriteSource(config.basePath), customSource],
      fallbackIconName: NDWU_ICON_NAME.WARNING_S,
    } satisfies NdwuIconSpriteConfig,
  };
};

/**
 * Provide only the core icon sprite.
 *
 * Use this when the app needs only core icons and serves the sprite from a
 * non-default location. Without this provider, the token default uses `assets`.
 * These icon providers set the same token; use only one of them.
 *
 * @param options.basePath - Directory where the core sprite is served. Defaults to `assets`.
 */
export const provideNdwuCoreIcons = (options?: NdwuSpritePathOptions): Provider => {
  return {
    provide: NDWU_ICON_SPRITE_CONFIG,
    useValue: {
      sources: [createCoreSpriteSource(options?.basePath)],
      fallbackIconName: NDWU_ICON_NAME.WARNING_S,
    } satisfies NdwuIconSpriteConfig,
  };
};
