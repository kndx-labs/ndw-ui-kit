import {InjectionToken, Provider} from '@angular/core';
import {BASE_ICON_NAMES, EXTRA_ICON_NAME, ICON_NAME, IconName} from '../../icon-names';

export interface NdwuIconSpriteSource {
  path: string;
  iconNames: readonly IconName[];
}

export interface NdwuIconSpriteConfig {
  sources: readonly NdwuIconSpriteSource[];
  fallbackIconName: IconName;
}

const CORE_SPRITE_SOURCE: NdwuIconSpriteSource = {
  path: 'assets/ndw-ui-kit.sprite.svg',
  iconNames: BASE_ICON_NAMES,
};

const EXTRA_SPRITE_SOURCE: NdwuIconSpriteSource = {
  path: 'assets/ndw-ui-kit.extra.sprite.svg',
  iconNames: Object.values(EXTRA_ICON_NAME),
};

export const NDWU_ICON_SPRITE_CONFIG = new InjectionToken<NdwuIconSpriteConfig>(
  'NDWU_ICON_SPRITE_CONFIG',
  {
    factory: () => {
      return {
        sources: [CORE_SPRITE_SOURCE],
        fallbackIconName: ICON_NAME.WARNING_S,
      };
    },
  },
);

export const provideAllNdwUiKitIcons = (): Provider => {
  return {
    provide: NDWU_ICON_SPRITE_CONFIG,
    useValue: {
      sources: [CORE_SPRITE_SOURCE, EXTRA_SPRITE_SOURCE],
      fallbackIconName: ICON_NAME.WARNING_S,
    } satisfies NdwuIconSpriteConfig,
  };
};

/**
 * Provide a custom subset sprite alongside the core sprite.
 *
 * Use this when your app relies on only a subset of the extra icons and you
 * have generated a custom sprite with the `ndw-ui-kit-build-sprite` CLI.
 *
 * @example
 * ```ts
 * import {provideNdwUiKitCustomIcons} from '@ndw-ui-kit/core';
 * import {icons} from './my-icons.config';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideNdwUiKitCustomIcons({
 *       path: 'assets/my-custom.sprite.svg',
 *       iconNames: icons,
 *     }),
 *   ],
 * });
 * ```
 *
 * @param config.path       - URL/path to the custom sprite SVG file served by your app.
 * @param config.iconNames  - The icon names included in the custom sprite.
 *                            Accepts `readonly IconName[]` so you can pass the typed array
 *                            exported by your config file directly.
 */
export const provideNdwUiKitCustomIcons = (config: {
  path: string;
  iconNames: readonly IconName[];
}): Provider => {
  const customSource: NdwuIconSpriteSource = {
    path: config.path,
    iconNames: config.iconNames,
  };

  return {
    provide: NDWU_ICON_SPRITE_CONFIG,
    useValue: {
      sources: [CORE_SPRITE_SOURCE, customSource],
      fallbackIconName: ICON_NAME.WARNING_S,
    } satisfies NdwuIconSpriteConfig,
  };
};
