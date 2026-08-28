import {ICON_NAME, IconName} from '../../../icon-names';

const ICON_VALUES: readonly string[] = Object.values(ICON_NAME);

/**
 * Type guard: true when `value` is a known IconName.
 */
export function isIconName(value: string): value is IconName {
  return ICON_VALUES.includes(value);
}

/**
 * Coerces a string or IconName to a valid IconName.
 *
 * 1. If `value` is already a known icon value, returns it.
 * 2. If `value` matches an icon value case-insensitively, returns that icon.
 * 3. **Fallback:** If no match is found, logs a console warning and returns the first
 *    icon in the catalog. Use this only for optional or legacy inputs; prefer validating
 *    icon names before calling to avoid silent fallback.
 */
export function iconNameTransform(value: string | IconName): IconName {
  if (isIconName(value)) {
    return value;
  }

  const lowerValue = value.toLowerCase();
  const matchingKey = (Object.keys(ICON_NAME) as (keyof typeof ICON_NAME)[])
    .find((key) => ICON_NAME[key].toLowerCase() === lowerValue);

  if (matchingKey !== undefined) {
    return ICON_NAME[matchingKey];
  }

  const fallbackIcon = ICON_NAME.WARNING_S ?? ICON_VALUES[0];

  console.warn(`Invalid icon name: "${value}". Using fallback: ${fallbackIcon}`);

  return fallbackIcon;
}

/**
 * Ensures the icon exists in currently configured sprite sources.
 * Falls back to configured fallback icon and emits a warning when unavailable.
 */
export function ensureAvailableIconName(
  iconName: IconName,
  availableIconNames: readonly IconName[],
  fallbackIconName: IconName,
): IconName {
  if (availableIconNames.includes(iconName)) {
    return iconName;
  }

  // dprint-ignore
  console.warn(`[ndwu-icon] Icon "${iconName}" is not available in configured sprite sources. Using fallback: ${fallbackIconName}. `);

  if (availableIconNames.includes(fallbackIconName)) {
    return fallbackIconName;
  }

  const firstAvailableIcon = availableIconNames[0] ?? ICON_NAME.WARNING_S ?? ICON_VALUES[0];

  // dprint-ignore
  console.warn(`[ndwu-icon] Fallback icon "${fallbackIconName}" is not available. Using: ${firstAvailableIcon}.`);

  return firstAvailableIcon;
}

/**
 * Gets size CSS class from an IconName (e.g. "add_folder_L" -> "dims-L").
 * Returns `undefined` and logs a console error if no known suffix is present in the IconName.
 */
export const extractDimsClass = (name: IconName): string | undefined => {
  const match = (name as string).match(/_([A-Z]+)$/);

  if (!match) {
    console.error(`[ndwu-icon] Cannot determine dimensions class for icon "${name}": no recognised size suffix.`);

    return undefined;
  }

  const suffix = match[1];

  return `dims-${suffix}`;
};
