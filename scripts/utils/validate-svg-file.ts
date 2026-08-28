import {extractIconSizeSuffix, extractSvgDimensions} from './svg';

export interface ValidationResult {
  isValid: boolean;
  skipReason?: string;
  suffix?: string;
}

type SupportedSuffixes = Set<string> | readonly string[] | Record<string, number>;

export function validateSvgFile(
  filename: string,
  supportedSuffixes: SupportedSuffixes,
  expectedDimensions: Record<string, number>,
  filePath: string,
): ValidationResult {
  const stem = filename.replace(/\.svg$/, '');
  const suffix = extractIconSizeSuffix(stem);

  if (!suffix) {
    return {isValid: false, skipReason: 'unsupported size suffix'};
  }

  let hasSuffix = false;

  if ('has' in supportedSuffixes) {
    hasSuffix = (supportedSuffixes as Set<string>).has(suffix);
  } else if (Array.isArray(supportedSuffixes)) {
    hasSuffix = (supportedSuffixes as readonly string[]).includes(suffix);
  } else {
    hasSuffix = suffix in supportedSuffixes;
  }

  if (!hasSuffix) {
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
