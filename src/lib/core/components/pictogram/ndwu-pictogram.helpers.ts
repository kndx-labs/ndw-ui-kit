import {NDWU_PICTOGRAM_NAME, NdwuPictogramName} from '../../../pictogram-names';

const PICTOGRAM_VALUES: readonly string[] = Object.values(NDWU_PICTOGRAM_NAME);

export function isPictogramName(value: string): value is NdwuPictogramName {
  return PICTOGRAM_VALUES.includes(value);
}

export function pictogramNameTransform(value: string | NdwuPictogramName): NdwuPictogramName {
  if (isPictogramName(value)) {
    return value;
  }

  const lowerValue = value.toLowerCase();
  const matchingKey = (Object.keys(NDWU_PICTOGRAM_NAME) as (keyof typeof NDWU_PICTOGRAM_NAME)[]).find(
    (key) => NDWU_PICTOGRAM_NAME[key].toLowerCase() === lowerValue,
  );

  if (matchingKey !== undefined) {
    return NDWU_PICTOGRAM_NAME[matchingKey];
  }

  const firstPictogram = PICTOGRAM_VALUES[0] as NdwuPictogramName;

  console.warn(`Invalid pictogram name: "${value}". Using fallback: ${firstPictogram}`);

  return firstPictogram;
}

const VALID_SIZE_SUFFIXES = ['L', 'XL'] as const;

/**
 * Gets size CSS class from a NdwuPictogramName (e.g. "pictogram_connection1_L" -> "dims-L").
 * Returns `undefined` if no known suffix is present or suffix is not a valid size.
 */
export const extractPictogramDimsClass = (name: NdwuPictogramName): string | undefined => {
  const match = name.match(/_([A-Z]+)$/);

  if (!match) {
    return;
  }

  const suffix = match[1];

  if (!VALID_SIZE_SUFFIXES.includes(suffix as typeof VALID_SIZE_SUFFIXES[number])) {
    return;
  }

  return `dims-${suffix}`;
};
