import {beforeAll} from 'vitest';
import {waitForTheme} from './helpers/tokens';

const NO_MOTION_STYLE_ID = 'ndwu-test-no-motion';

const disableMotion = (): void => {
  if (document.getElementById(NO_MOTION_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = NO_MOTION_STYLE_ID;
  style.textContent = '*, *::before, *::after {'
    + 'transition: none !important;'
    + 'animation: none !important;'
    + '}';
  document.head.appendChild(style);
};

beforeAll(async () => {
  disableMotion();
  await waitForTheme();
});

// Fixture teardown lives in helpers/mount.ts, not here: setupFiles are loaded
// by Vite's dev pipeline directly and can't resolve the "@ndw-ui-kit/core"
// tsconfig alias that the mount helper needs, so mount.ts registers its own
// afterEach at import time instead.
