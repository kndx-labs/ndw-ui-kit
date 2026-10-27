import {readFileSync} from 'node:fs';

// Size suffix → expected width/height in px; keys are the only supported suffixes of each pipeline
export const ICON_EXPECTED_DIMENSIONS: Readonly<Record<string, number>> = {
  XS: 16,
  S: 20,
  L: 24,
  XL: 50,
};
export const PICTOGRAM_EXPECTED_DIMENSIONS: Readonly<Record<string, number>> = {L: 64, XL: 100};

export const isSvgFile = (filename: string): boolean => filename.endsWith('.svg');

const SVG_TAG_REGEX = /<svg[^>]*>/i;
const SVG_OPEN_TAG_REGEX = /<svg/i;
// `(?<![\w-])` keeps `stroke-width` / `data-width` from matching `width`
const SVG_WIDTH_REGEX = /(?<![\w-])width\s*=\s*["']([^"']*)["']/i;
const SVG_HEIGHT_REGEX = /(?<![\w-])height\s*=\s*["']([^"']*)["']/i;
const SVG_VIEWBOX_REGEX = /(?<![\w-])viewBox\s*=\s*["']([^"']*)["']/i;

export interface SvgDimensions {
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

const toSvgDimensions = (widthValue: string, heightValue: string): SvgDimensions | undefined => {
  const width = Math.round(parseFloat(widthValue));
  const height = Math.round(parseFloat(heightValue));

  if (Number.isNaN(width) || Number.isNaN(height)) {
    return undefined;
  }

  return {width, height};
};

/**
 * Extract width and height from the root `<svg>` tag: `width`/`height` attributes first, then `viewBox`.
 */
const parseSvgTagDimensions = (svgTag: string): SvgDimensions | undefined => {
  const widthMatch = svgTag.match(SVG_WIDTH_REGEX);
  const heightMatch = svgTag.match(SVG_HEIGHT_REGEX);

  if (widthMatch && heightMatch) {
    const dimensions = toSvgDimensions(widthMatch[1], heightMatch[1]);

    if (dimensions) {
      return dimensions;
    }
  }

  const viewBoxParts = svgTag.match(SVG_VIEWBOX_REGEX)?.[1].trim().split(/[\s,]+/);

  if (viewBoxParts?.length !== 4) {
    return undefined;
  }

  return toSvgDimensions(viewBoxParts[2], viewBoxParts[3]);
};

/**
 * Extract width and height of the root `<svg>` element from SVG markup.
 */
export const parseSvgDimensions = (content: string): SvgDimensions | undefined => {
  const svgTag = content.match(SVG_TAG_REGEX)?.[0];

  if (!svgTag) {
    return undefined;
  }

  return parseSvgTagDimensions(svgTag);
};

/**
 * Extract width and height of the root `<svg>` element from an SVG file.
 */
export const extractSvgDimensions = (filePath: string): SvgDimensions | undefined => {
  return parseSvgDimensions(readFileSync(filePath, 'utf-8'));
};

export const prepareSvgForSprite = (filePath: string): PreparedSvgForSpriteResult => {
  const content = readFileSync(filePath, 'utf-8');
  const parentTagMatches = content.match(SVG_TAG_REGEX);

  if (!parentTagMatches?.length) {
    return {ok: false, reason: 'missing-svg-tag'};
  }

  const parentTag = parentTagMatches[0];
  const dimensions = parseSvgTagDimensions(parentTag);

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

const XLINK_HREF_REGEX = /(?<![\w-])xlink:href\s*=/g;
const XLINK_NAMESPACE_REGEX = /\s+xmlns:xlink\s*=\s*(["'])[^"']*\1/g;

/**
 * Replace SVG 1.1 `xlink:href` with SVG 2 `href` and drop the `xmlns:xlink` declaration.
 *
 * Sprites are built in svg-sprite inline mode, which omits namespace declarations on the root `<svg>`.
 * A leftover `xlink:` prefix makes the sprite invalid XML, and browsers stop rendering an external
 * sprite at the first such symbol.
 */
export const replaceXlinkHref = (content: string): string => {
  return content
    .replace(XLINK_HREF_REGEX, 'href=')
    .replace(XLINK_NAMESPACE_REGEX, '');
};

// extracts the trailing uppercase size suffix from an icon filename:
// "check_L" → "L", "close_XS" → "XS", "user-mobile_" → undefined
export const extractIconSizeSuffix = (iconName: string): string | undefined => {
  const match = iconName.match(/_([A-Z]+)$/);

  return match ? match[1] : undefined;
};

export type SvgSkipKind =
  | 'unsupported' // the file is outside the pipeline's scope (e.g. an unknown size suffix); skip with a warning.
  | 'invalid'; // the file is in scope but broken (e.g. wrong dimensions); the build must fail.

export interface SvgValidationSuccess {
  isValid: true;
  suffix: string;
}

export interface SvgValidationFailure {
  isValid: false;
  kind: SvgSkipKind;
  skipReason: string;
}

export type ValidationResult = SvgValidationSuccess | SvgValidationFailure;

/**
 * Validate an SVG file by its size suffix and actual dimensions.
 */
export function validateSvgFile(
  filename: string,
  filePath: string,
  //
  // Map of supported size suffix → expected width/height in px.
  // Suffixes missing from the map are reported as `unsupported`.
  //
  expectedDimensions: Readonly<Record<string, number>>,
): ValidationResult {
  const stem = filename.replace(/\.svg$/, '');
  const suffix = extractIconSizeSuffix(stem);

  if (!suffix || !(suffix in expectedDimensions)) {
    return {isValid: false, kind: 'unsupported', skipReason: 'unsupported size suffix'};
  }

  const dims = extractSvgDimensions(filePath);

  if (!dims) {
    return {isValid: false, kind: 'invalid', skipReason: 'could not determine dimensions'};
  }

  const expectedSize = expectedDimensions[suffix];

  if (dims.width !== expectedSize || dims.height !== expectedSize) {
    return {
      isValid: false,
      kind: 'invalid',
      skipReason: `dimensions ${dims.width}×${dims.height}px don't match expected ${expectedSize}×${expectedSize}px`,
    };
  }

  return {isValid: true, suffix};
}
