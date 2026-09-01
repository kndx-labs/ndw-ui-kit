# Drawer spec conformance — findings

Spec: `md_design/drawer.md` · Component: `NdwuDrawerContainerComponent`
Rules: `src/tests/drawer/drawer.rules.md` (18 testable, 12 governance)

## Code divergences — implementation differs from the specification

| Rule | Expected (spec) | Actual (code) | Recommendation |
|---|---|---|---|
| DRW-LAY-01 / DRW-DOD-05 | "The **primary button is always on the right** of the footer" (`drawer.md:73`, restated `drawer.md:197`). | The footer computes `justify-content: flex-start` (`_ndwu-modal-mixins.scss:13` `ndwu-modal-footer()` + `.ndwu-modal__actions` at `ndwu-modal.scss:18`); no `flex-end` / `margin-left: auto` anywhere. Buttons left-pack. The primary is the last DOM child (button order `[cancel, primary]`), so it sits right *of its sibling* but the footer is not edge-right-aligned. | **Fix spec or code.** Either right-align the footer (`justify-content: flex-end`) to match the spec, or restate the spec as left-packed with primary last. The test asserts only the DOM order (primary is the last footer child). |

## Not enforceable by the component

12 `[DS]` governance rules (`DRW-CMP-01..08`, `DRW-DOD-01..04`) — the entire
"Signals — Drawer vs Modal vs Page" and "Decision matrix" material, plus the
when/when-not/do-don't usage guidance. These are surface-choice governance a
single component cannot make. Listed in `drawer.rules.md`'s governance section,
not in the test suite. No action.

## Harness / spec limits (it.todo)

| Rule | Limit |
|---|---|
| DRW-LAY-02 | `<400px` full-width footer needs a narrow window plus footer buttons. |
| DRW-LAY-04 / DRW-LAY-05 | Mobile-always-XL and handset full-width / no-radius need a mobile viewport (specs pin desktop 1280×800). |
| DRW-ELV-02 | The slide-in/out animation (~300ms) cannot be observed — `setup.ts` disables all motion in the conformance run. |
| DRW-BHV-02 | Body scroll behavior needs overflowing content to observe the scroll container. |

## Summary

- 12 rules directly tested (surface + footer-primary color, title typography,
  desktop widths XL 700 / XXL 1200, header/footer borders, backdrop +
  scroll-lock, role/aria, focus + ESC, dismissal + disableClose, footer-optional,
  footer DOM order).
- 1 code/spec divergence (footer alignment, DRW-LAY-01 / DRW-DOD-05).
- 6 rules tracked as `it.todo` (5 harness/spec-gap, 1 divergence restatement).
- 12 rules left to design-system governance, not the component.
- Coverage: `yarn check:spec-coverage` confirms all 18 testable DRW rules are
  referenced, all 12 governance rules have none, and `drawer.rules.md` is not
  stale relative to `md_design/drawer.md`.
