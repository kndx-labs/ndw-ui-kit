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
