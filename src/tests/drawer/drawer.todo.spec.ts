import {describe, it} from 'vitest';

/**
 * Every DRW-* rule in drawer.rules.md with no real test needs a reference here,
 * or check:spec-coverage fails. Pure [DS] governance rules are NOT listed.
 */

describe('[SPEC GAP / HARNESS LIMIT] not reachable as written', () => {
  it.todo('DRW-LAY-02 — <400px footer full-width: needs a narrow window plus footer buttons');
  it.todo('DRW-LAY-04 — mobile always uses XL: needs a mobile viewport');
  it.todo('DRW-LAY-05 — mobile full-width / no radius / tighter padding: needs a mobile viewport');
  it.todo('DRW-ELV-02 — slide-in/out animation (~300ms): motion is disabled in the conformance run');
  it.todo('DRW-BHV-02 — body scroll area: needs overflowing content to observe the scroll container');
});

describe('[DIVERGENCE] code differs from spec (see FINDINGS.md)', () => {
  it.todo('DRW-DOD-05 — "keep the primary action on the right": footer computes flex-start (restates DRW-LAY-01)');
  // DRW-LAY-01 (footer alignment) keeps a real assertion on its measurable
  // part (primary is the last footer child), so it is covered by
  // drawer.behavior.spec.ts rather than a todo.
});
