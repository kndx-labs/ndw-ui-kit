import {extractIconSizeSuffix, extractSvgDimensions} from './svg';

export interface ValidationResult {
  isValid: boolean;
  skipReason?: string;
  suffix?: string;
}

/**
 * Validate an SVG file by its size suffix and actual dimensions.
 *
 * @param expectedDimensions - Map of supported size suffix → expected width/height in px.
 *                             Suffixes missing from the map are rejected.
 */
export function validateSvgFile(
  filename: string,
  expectedDimensions: Readonly<Record<string, number>>,
  filePath: string,
): ValidationResult {
  const stem = filename.replace(/\.svg$/, '');
  const suffix = extractIconSizeSuffix(stem);

  if (!suffix || !(suffix in expectedDimensions)) {
    return {isValid: false, skipReason: 'unsupported size suffix'};
  }

  const dims = extractSvgDimensions(filePath);

  if (!dims) {
    return {isValid: false, skipReason: 'could not determine dimensions'};
  }

  const expectedSize = expectedDimensions[suffix];

  if (dims.width !== expectedSize || dims.height !== expectedSize) {
    return {
      isValid: false,
      skipReason: `dimensions ${dims.width}×${dims.height}px don't match expected ${expectedSize}×${expectedSize}px`,
    };
  }

  return {isValid: true, suffix};
}
