import {describe, it} from 'vitest';

/**
 * Every DLG-* rule in dialog.rules.md that has no real test needs a reference
 * here, or check:spec-coverage fails. Pure [DS] governance rules are NOT listed
 * (they must have zero references) — they live only in dialog.rules.md's
 * governance section.
 */

describe('[SPEC GAP / HARNESS LIMIT] not reachable as written', () => {
  it.todo('DLG-LAY-02 — <400px footer full-width: needs a narrow window plus footer buttons');
  it.todo('DLG-LAY-06 — mobile full-screen / squared bottom corners: needs a mobile viewport');
  it.todo('DLG-CMP-01 — "use a modal for immediate feedback": DS intent; alert()/confirm() helpers exist but the guidance is not component-assertable');
  it.todo('DLG-BHV-02 — body scroll area: needs overflowing content to observe the scroll container');
  it.todo('DLG-DOD-04 — vertical body scroll / no horizontal scroll: needs overflowing content');
});

describe('[DIVERGENCE] code differs from spec (see FINDINGS.md)', () => {
  it.todo('DLG-LAY-05 — max size: impl 90vw/90vh/min-width 300px vs spec 80%/~280px');
  // DLG-SHP-01 (radius) and DLG-LAY-01 (footer alignment) are also divergences
  // but keep a real assertion on their measurable part, so they are covered by
  // dialog.appearance.spec.ts / dialog.behavior.spec.ts rather than a todo.
});
