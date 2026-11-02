const THEME_CLASSES = ['ndwu-theme-light', 'ndwu-theme-dark'] as const;
const THEME_SELECTOR = THEME_CLASSES.map((cls) => `.${cls}`).join(', ');

/**
 * Detects the effective theme class for given DOM element:
 * Walks up from origin and returns the first ancestor with .ndwu-theme-light or .ndwu-theme-dark.
 * Returns null when no override is present (global :root theme applies).
 */
export const detectThemeClass = (origin: HTMLElement): string | null => {
  const themed = origin.closest(THEME_SELECTOR);

  if (!themed) {
    return null;
  }

  for (const cls of THEME_CLASSES) {
    if (themed.classList.contains(cls)) {
      return cls;
    }
  }

  return null;
};

/**
 * Applies the detected theme class to the given HTML element.
 * Removes any existing ndwu-theme-* class first.
 */
export const applyThemeClass = (
  element: HTMLElement,
  themeClass: string | null,
): void => {
  for (const cls of THEME_CLASSES) {
    element.classList.remove(cls);
  }

  if (themeClass) {
    element.classList.add(themeClass);
  }
};
