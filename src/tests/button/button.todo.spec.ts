import {describe, it} from 'vitest';

/**
 * Every rule in md_design/button.md is referenced by a test. The rules below
 * cannot be asserted, for one of three reasons. Each todo names the reason so
 * that a blank test is never mistaken for missing coverage.
 */

describe('[DS] not enforceable by the component', () => {
  it.todo('BTN-CLR-03 — negative colour is reserved for risky or destructive actions');
  it.todo('BTN-LAY-01 — size guide: which size suits which context');
  it.todo('BTN-VAR-02 — primary: single most important action, once per screen');
  it.todo('BTN-VAR-03 — secondary: supporting or alternative actions');
  it.todo('BTN-VAR-04 — tertiary: least important actions, never deletion');
  it.todo('BTN-VAR-05 — ghost: safe actions, used as a link analogue');
  it.todo('BTN-VAR-06 — negative: irreversible actions, exceptional use only');
  it.todo('BTN-VAR-07 — positive: encouraging actions needing no immediate reaction');
  it.todo('BTN-VAR-08 — warning: warnings that need the user\'s attention');
  it.todo('BTN-VAR-09 — the documented negative/critical usage list');
  it.todo('BTN-ACC-02 — aria-pressed belongs to a consumer owning toggle state');
  it.todo('BTN-DOD-01 — exactly one primary button per screen or modal');
  it.todo('BTN-DOD-02 — no tertiary or negative styling for frequent actions');
});

describe('[SPEC GAP] cannot be tested as written', () => {
  it.todo('BTN-LAY-05 — per-size padding: the spec states no values (code has 6/8, 8/12, 4/16, 8/20)');
  it.todo('BTN-ELV-01 — hover drop-shadow: "subtle", no token or value given (code: drop-shadow(1px 1px 2px -1px #00000024))');
  it.todo('BTN-SHP-03 — ghost/tertiary border "transparent OR token-driven": two acceptable outcomes');
  it.todo('BTN-DOD-03 — duplicates BTN-ACC-01; one rule should not hold two IDs');
  it.todo('BTN-DOD-05 — positive/warning exist in Figma but not in BUTTON_VARIANT; unresolved in the spec');
});

describe('[HARNESS LIMIT] well specified, not reachable by this tooling', () => {
  it.todo('BTN-STA-01 — pressed (:active) requires holding a pointer across the assertion');
});
