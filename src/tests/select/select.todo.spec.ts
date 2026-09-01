import {describe, it} from 'vitest';

/**
 * Every SEL-* rule in select.rules.md with no real test needs a reference here,
 * or check:spec-coverage fails. Pure [DS] governance rules are NOT listed.
 */

describe('[SPEC GAP / HARNESS LIMIT] not reachable as written', () => {
  it.todo('SEL-CLR-02 — status recolor (negative/positive): needs a form-control validation state');
  it.todo('SEL-TYP-01 — per-size type scale: font step per field size, spec gives no explicit px');
  it.todo('SEL-LAY-03 — desktop option max width 640px / ellipsis: needs long options in an open panel');
  it.todo('SEL-LAY-04 — mobile option 2-line wrap: needs a mobile viewport');
  it.todo('SEL-LAY-05 — per-size row padding (48/32/24): needs an open panel and option measurement');
  it.todo('SEL-LAY-06 — mobile bottom sheet +4px padding: needs a mobile viewport');
  it.todo('SEL-MOT-01 — label 200ms / other 150ms: motion is disabled in the conformance run');
  it.todo('SEL-MOT-02 — honour prefers-reduced-motion: motion is disabled in the conformance run');
  it.todo('SEL-CMP-01 — state/status/value axes: a design enumeration, not a single assertion');
  it.todo('SEL-CMP-04 — dropdown item types (multi/link/icon): dropdown-menu variants, not the single-select field');
  it.todo('SEL-CMP-05 — item anatomy slots: dropdown-menu variants, not wired in the single-select field');
  it.todo('SEL-ACC-03 — autocomplete keyboard model: a separate variant, not the single-select field');
  it.todo('SEL-DOD-02 — max visible options per size then scroll: needs enough options to overflow');
  it.todo('SEL-DOD-04 — honour reduced motion for open/label: motion is disabled in the conformance run');
});

describe('[DIVERGENCE] code differs from spec (see FINDINGS.md)', () => {
  it.todo('SEL-CMP-03 — status helper defaults ("Something went wrong" / "Everything checks out") are not auto-substituted by the field');
});
