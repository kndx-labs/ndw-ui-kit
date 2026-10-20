import {NDWU_PICTOGRAM_VARIANTS} from '../../../src/lib/pictogram-presets';

export interface MatchPictogramPresetResult {
  presetName: string;
  firstColor: string;
  secondColor: string;
  matched: true;
}

export interface NoMatchResult {
  matched: false;
  skipReason: string;
}

export type PictogramPresetMatch = MatchPictogramPresetResult | NoMatchResult;

/**
 * Normalize a color string for comparison.
 * Uppercases hex values; leaves others as-is.
 */
function normalizeColor(color: string): string {
  if (color.startsWith('#') && color.length === 7) {
    return color.toUpperCase();
  }

  return color;
}

/**
 * Extract all unique fill/stroke colors from an SVG string,
 * scanning every element except those inside `<defs>`.
 * Ignores `none` and `transparent`.
 */
export function extractAllSvgColors(svgContent: string): Set<string> {
  const colors = new Set<string>();
  // Remove <defs>...</defs> so internal shapes (e.g. clipPath rects) don't pollute the color set
  const withoutDefs = svgContent.replace(/<defs[\s\S]*?<\/defs>/gi, '');
  const regex = /\b(fill|stroke)="([^"]*)"/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(withoutDefs)) !== null) {
    const value = match[2].trim();

    if (value !== 'none' && value !== 'transparent') {
      colors.add(normalizeColor(value));
    }
  }

  return colors;
}

/**
 * Match a set of extracted SVG colors against NDWU_PICTOGRAM_VARIANTS.
 * A pictogram must contain exactly 2 colors that match a preset pair
 * (order-independent).
 */
export function matchPictogramPreset(colors: Set<string>): PictogramPresetMatch {
  if (colors.size === 0) {
    return {matched: false, skipReason: 'No colors found in SVG'};
  }

  if (colors.size !== 2) {
    return {matched: false, skipReason: `Found ${colors.size} unique colors (expected exactly 2)`};
  }

  const svgColors = Array.from(colors);

  for (const [presetName, preset] of Object.entries(NDWU_PICTOGRAM_VARIANTS)) {
    const presetFirst = normalizeColor(preset.firstColor);
    const presetSecond = normalizeColor(preset.secondColor);
    const presetColors = new Set([presetFirst, presetSecond]);

    if (svgColors.every((c) => presetColors.has(c))) {
      return {
        presetName,
        firstColor: presetFirst,
        secondColor: presetSecond,
        matched: true,
      };
    }
  }

  return {
    matched: false,
    skipReason: `Colors [${svgColors.join(', ')}] do not match any known preset`,
  };
}
