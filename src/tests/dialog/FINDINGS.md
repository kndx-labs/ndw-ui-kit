# Dialog spec conformance — findings

Spec: `md_design/dialog.md` · Component: `NdwuDialogContainerComponent`
Rules: `src/tests/dialog/dialog.rules.md` (17 testable, 12 governance)

## Code divergences — implementation differs from the specification

| Rule | Expected (spec) | Actual (code) | Recommendation |
|---|---|---|---|
| DLG-SHP-01 | Corner radius scales with the size set — L 8px, XL 12px, XXL 16px — and the default dialog radius is XL (12px) (`dialog.md:122-128`, frontmatter `radius: XL`). | The dialog is pinned to a single fixed radius: `dialog-border-radius: radius.$radius-L` = **8px** (`ndwu-dialog-container.tokens.scss:10`, `styles/radius.scss` `$radius-L: 8px`), applied unconditionally (`ndwu-dialog-container.component.scss:38`). There is no size-set input — `NdwuModalConfig` exposes only width/height dimensions (`ndwu-modal.types.ts:27-52`), so XL/XXL radii can never render. Only 8px is observable. | **Fix spec or code.** Either add a size-set input that drives the radius per the L/XL/XXL table, or update the spec to state the dialog uses a fixed 8px radius. The test asserts the reachable 8px only. |
| DLG-LAY-01 | "The container **right-aligns** the desktop footer" — the primary button sits at the right edge (`dialog.md:82`). | The footer computes `justify-content: flex-start` (`_ndwu-modal-mixins.scss` `ndwu-modal-footer()` + `.ndwu-modal__actions` in `ndwu-modal.scss`); there is no `flex-end` / `margin-left: auto` anywhere in the modal styles. Buttons left-pack. The primary is the last DOM child (`confirm()` / button order builds `[cancel, primary]`), so it is visually right *of its sibling* but the footer is not edge-right-aligned. | **Fix spec or code.** Either right-align the footer (`justify-content: flex-end`) to match the spec, or restate the spec as left-packed with primary last. The test asserts only the DOM order (primary is the last footer child). |
| DLG-LAY-05 | Max **height 90%**, max **width 80%** of the viewport; **minimum determined by content** (≈280px) (`dialog.md:94`). | Impl applies `--dialog-max-width: 90vw`, `--dialog-max-height: 90vh`, `--dialog-min-width: 300px` (`ndwu-dialog-container.component.scss:24-26`). Width cap is 90% not 80%, and the minimum is a fixed 300px not content-driven ≈280px. `dialog.md:97-99` already flags this as an Open item. | **Fix spec or code**, a design-system judgment call. No passing assertion is written; tracked as `it.todo` (`DLG-LAY-05`). |

## Not enforceable by the component

12 `[DS]` governance rules (`DLG-TYP-02`, `DLG-LAY-03`, `DLG-LAY-04`, `DLG-LAY-07`, `DLG-ELV-02`, `DLG-CMP-02..05`, `DLG-DOD-01..03`) — usage/content-layout guidance a single component cannot verify. Listed in `dialog.rules.md`'s governance section, not in the test suite. No action; recorded so their absence of a test is not mistaken for missing coverage.

## Harness / spec limits (it.todo)

| Rule | Limit |
|---|---|
| DLG-LAY-02 | `<400px` full-width footer needs a narrow window plus footer buttons. |
| DLG-LAY-06 | Mobile full-screen / squared bottom corners need a mobile viewport (specs pin desktop 1280×800). |
| DLG-CMP-01 | "Use a modal for immediate feedback" is design-system intent; the `alert()`/`confirm()` helpers exist but the guidance itself is not component-assertable. |
| DLG-BHV-02 / DLG-DOD-04 | Body scroll behavior needs overflowing content to observe the scroll container. |

## Summary

- 11 rules directly tested (color, footer-primary color, title typography, radius, backdrop + scroll-lock, role/aria, focus + ESC, dismissal + disableClose, footer-optional, footer DOM order).
- 3 code/spec divergences (radius, footer alignment, max size).
- 6 rules tracked as `it.todo` (5 harness/spec-gap, 1 divergence with no passing assertion).
- 12 rules left to design-system governance, not the component.
- Coverage: `yarn check:spec-coverage` confirms all 17 testable DLG rules are referenced by a test or todo, all 12 governance rules have none, and `dialog.rules.md` is not stale relative to `md_design/dialog.md`.
