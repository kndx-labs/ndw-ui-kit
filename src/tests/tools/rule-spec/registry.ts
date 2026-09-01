import {ComponentSpecConfig} from './types';
import {buttonConfig} from './button.config';
import {dialogConfig} from './dialog.config';
import {drawerConfig} from './drawer.config';

export const COMPONENTS: ComponentSpecConfig[] = [buttonConfig, dialogConfig, drawerConfig];

// Cross-component separation rests entirely on the 3-letter prefix, and the
// coverage checker's ID regex requires prefix + section codes to be exactly 3
// uppercase letters. Enforce both invariants at load, loudly, rather than let
// an off-shape prefix silently produce IDs the checker skips.
for (const config of COMPONENTS) {
  if (!/^[A-Z]{3}$/.test(config.prefix)) {
    throw new Error(`config for ${config.rulesFile}: prefix "${config.prefix}" must be exactly 3 uppercase letters`);
  }
}

const prefixes = COMPONENTS.map((c) => c.prefix);

if (new Set(prefixes).size !== prefixes.length) {
  throw new Error(`registry: duplicate component prefix in [${prefixes.join(', ')}]`);
}

export const getComponent = (name: string): ComponentSpecConfig => {
  const found = COMPONENTS.find(
    (c) => c.prefix === name.toUpperCase() || c.displayName.toLowerCase() === name.toLowerCase(),
  );

  if (!found) {
    throw new Error(`unknown component "${name}"; known: ${COMPONENTS.map((c) => c.displayName).join(', ')}`);
  }

  return found;
};
