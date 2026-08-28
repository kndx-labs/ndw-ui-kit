import {readFileSync} from 'node:fs';

export const STANDARD_ICON_SIZE_SUFFIX: Readonly<Record<string, number>> = {
  XS: 16,
  S: 20,
  L: 24,
  XL: 50,
};

export const KNOWN_SUFFIXES_STR = Object.keys(STANDARD_ICON_SIZE_SUFFIX).join(', ');

export const isSvgFile = (filename: string): boolean => filename.endsWith('.svg');

const SVG_TAG_REGEX = /<svg[^>]*>/i;
const SVG_OPEN_TAG_REGEX = /<svg/i;
const SVG_WIDTH_REGEX = /width\s*=\s*["'](\d+(?:\.\d+)?)/i;
const SVG_HEIGHT_REGEX = /height\s*=\s*["'](\d+(?:\.\d+)?)/i;
const SVG_VIEWBOX_DIMENSIONS_REGEX = /viewBox\s*=\s*["']\s*\d+\s+\d+\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i;

interface SvgDimensions {
  width: number;
  height: number;
}

interface PreparedSvgForSpriteSuccess {
  ok: true;
  content: string;
}

interface PreparedSvgForSpriteFailure {
  ok: false;
  reason: 'missing-svg-tag' | 'missing-dimensions';
}

export type PreparedSvgForSpriteResult = PreparedSvgForSpriteSuccess | PreparedSvgForSpriteFailure;

const parseSvgDimensions = (widthValue: string, heightValue: string): SvgDimensions | undefined => {
  const width = Math.round(parseFloat(widthValue));
  const height = Math.round(parseFloat(heightValue));

  if (Number.isNaN(width) || Number.isNaN(height)) {
    return undefined;
  }

  return {width, height};
};

const extractSvgDimensionsFromTag = (svgTag: string): SvgDimensions | undefined => {
  const widthMatch = svgTag.match(SVG_WIDTH_REGEX);
  const heightMatch = svgTag.match(SVG_HEIGHT_REGEX);

  if (widthMatch && heightMatch) {
    return parseSvgDimensions(widthMatch[1], heightMatch[1]);
  }

  const viewBoxMatch = svgTag.match(SVG_VIEWBOX_DIMENSIONS_REGEX);

  if (!viewBoxMatch) {
    return undefined;
  }

  return parseSvgDimensions(viewBoxMatch[1], viewBoxMatch[2]);
};

/**
 * Extract width and height from an SVG file using width/height attributes or viewBox.
 */
export const extractSvgDimensions = (filePath: string): {width: number; height: number} | undefined => {
  const content = readFileSync(filePath, 'utf-8');

  const widthMatch = content.match(/\bwidth="([^"]+)"/);
  const heightMatch = content.match(/\bheight="([^"]+)"/);

  if (widthMatch && heightMatch) {
    const width = Math.round(parseFloat(widthMatch[1]));
    const height = Math.round(parseFloat(heightMatch[1]));

    if (!isNaN(width) && !isNaN(height)) {
      return {width, height};
    }
  }

  const viewBoxMatch = content.match(/\bviewBox="([^"]+)"/);

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/\s+/);

    if (parts.length === 4) {
      const width = Math.round(parseFloat(parts[2]));
      const height = Math.round(parseFloat(parts[3]));

      if (!isNaN(width) && !isNaN(height)) {
        return {width, height};
      }
    }
  }

  return undefined;
};

export const prepareSvgForSprite = (filePath: string): PreparedSvgForSpriteResult => {
  const content = readFileSync(filePath, 'utf-8');
  const parentTagMatches = content.match(SVG_TAG_REGEX);

  if (!parentTagMatches?.length) {
    return {ok: false, reason: 'missing-svg-tag'};
  }

  const parentTag = parentTagMatches[0];
  const dimensions = extractSvgDimensionsFromTag(parentTag);

  if (!dimensions) {
    return {ok: false, reason: 'missing-dimensions'};
  }

  const hasWidthAttr = SVG_WIDTH_REGEX.test(parentTag);
  const hasHeightAttr = SVG_HEIGHT_REGEX.test(parentTag);

  if (hasWidthAttr && hasHeightAttr) {
    return {ok: true, content};
  }

  return {
    ok: true,
    content: content.replace(
      parentTag,
      parentTag.replace(SVG_OPEN_TAG_REGEX, `<svg width="${dimensions.width}" height="${dimensions.height}"`),
    ),
  };
};

// extracts the trailing uppercase size suffix from an icon filename:
// "check_L" → "L", "close_XS" → "XS", "user-mobile_" → undefined
export const extractIconSizeSuffix = (iconName: string): string | undefined => {
  const match = iconName.match(/_([A-Z]+)$/);

  return match ? match[1] : undefined;
};
