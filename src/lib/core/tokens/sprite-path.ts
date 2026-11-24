const DEFAULT_SPRITE_BASE_PATH = 'assets';

/**
 * Directory (relative path or absolute URL) where the kit sprite files are
 * served. Defaults to `assets`.
 */
export interface NdwuSpritePathOptions {
  basePath?: string;
}

export const resolveSpritePath = (
  fileName: string,
  basePath = DEFAULT_SPRITE_BASE_PATH,
): string => {
  if (basePath === '') {
    return fileName;
  }

  if (basePath.endsWith('/')) {
    return `${basePath}${fileName}`;
  }

  return `${basePath}/${fileName}`;
};

export const createCoreSpritePath = (basePath?: string): string => {
  return resolveSpritePath('ndw-ui-kit.sprite.svg', basePath);
};
