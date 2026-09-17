import {detectThemeClass} from '@ndw-ui-kit/core/utils';
import type {NdwuResolvedModalConfig} from './ndwu-modal.types';

export function resolveOverlayThemeClass(
  config: NdwuResolvedModalConfig,
  document: Document,
): string | null {
  if (config.theme) {
    return `ndwu-theme-${config.theme}`;
  }

  if (document.body instanceof HTMLElement) {
    return detectThemeClass(document.body);
  }

  return null;
}
