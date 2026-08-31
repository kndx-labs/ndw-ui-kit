const THEME_SENTINEL = '--ndwu-color-brand-50';

export const cssVar = (name: string, el: Element = document.documentElement): string => {
  return getComputedStyle(el).getPropertyValue(name)
.trim();
};

export const waitForTheme = async (timeoutMs = 2000): Promise<void> => {
  const deadline = performance.now() + timeoutMs;

  while (performance.now() < deadline) {
    if (cssVar(THEME_SENTINEL)) {
      return;
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  throw new Error(
    `theme stylesheet not injected: ${THEME_SENTINEL} is empty after ${timeoutMs}ms. `
    + 'The unit-test builder injects only "styles.css" — check that both global styles in '
    + 'playground:build:test share bundleName "styles".',
  );
};
