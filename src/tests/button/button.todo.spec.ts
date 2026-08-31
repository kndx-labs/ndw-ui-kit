import {describe, it} from 'vitest';

/**
 * Rules tagged [CODE] or [DS + CODE] that can't produce a real test, for one
 * of two reasons — plus one harness limitation. Pure [DS] rules are not
 * listed here at all: they're governance a component test cannot verify by
 * construction, and appear only in button.rules.md's out-of-scope list.
 */

describe('[SPEC GAP] cannot be tested as written', () => {
  it.todo('BTN-LAY-05 — per-size padding: the spec states no values (code has 6/8, 8/12, 4/16, 8/20)');
  it.todo('BTN-ELV-01 — hover drop-shadow: "subtle", no token or value given (code: drop-shadow(1px 1px 2px -1px #00000024))');
});

describe('[AMBIGUOUS/DUPLICATE] two acceptable outcomes or a restated rule', () => {
  it.todo('BTN-SHP-03 — ghost/tertiary border "transparent OR token-driven": two acceptable outcomes');
  it.todo('BTN-DOD-03 — duplicates BTN-ACC-01; one rule should not hold two IDs');
});

describe('[HARNESS LIMIT] well specified, not reachable by this tooling', () => {
  it.todo('BTN-STA-01 — pressed (:active) requires holding a pointer across the assertion');
});
