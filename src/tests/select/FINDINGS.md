# Select spec conformance — findings

Spec: `md_design/select.md` · Component: `NdwuSelectFieldComponent`
Rules: `src/tests/select/select.rules.md` (23 testable, 3 governance)

## Code divergences — implementation differs from the specification

| Rule | Expected (spec) | Actual (code) | Recommendation |
|---|---|---|---|
| SEL-CLR-01 | Helper text uses the form helper color `#6a6f7c` (`select.md:61`, frontmatter `helperColor: form-color-helper-default #6a6f7c`). | The helper message renders `--ndwu-helper-message-text` = `gray-60` = **`#515660`** (light theme) — not `#6a6f7c` (`ndwu-helper-message.tokens.scss:4`, `styles/themes/_light-theme.scss`). The trigger surface white part of the rule is correct and tested; the helper color diverges. | **Fix spec or token.** Point the helper token at the form helper color, or update the spec's hex. The test asserts only the (correct) white trigger surface. |
| SEL-CMP-03 | If an error/success hint is not provided, a default helper text is auto-used — `negative` → "Something went wrong"; `positive` → "Everything checks out" (`select.md:147`). | The select field renders only the supplied `hint` and does not auto-substitute status defaults — `select.md:150-152` flags this as an Open item / `[CODE]` decision (field vs form layer). | **Decide ownership.** Either the field auto-substitutes status default hints, or the spec assigns that to the form layer. Tracked as `it.todo` (`SEL-CMP-03`). |

## Open item (spec ambiguity, not a code divergence)

`select.md:87-90` — the `global-select` structure panel lists sizes `S, L, XL`
while the field/option notes list `L, XL, XXL`. This suite follows the supported
set **L / XL / XXL** (matching the code's size directive); `S` is not a supported
select size. No rule ID; noted for traceability.

## Not enforceable by the component

3 `[DS]` governance rules (`SEL-TYP-02`, `SEL-DOD-01`, `SEL-DOD-03`) — single-line
option / accessible-name usage guidance. Listed in `select.rules.md`'s governance
section, not in the test suite.

## Harness / spec limits (it.todo)

14 rules are tracked as `it.todo` — status recolor (needs a validation state),
per-size type scale, 640px option width + ellipsis, mobile 2-line wrap, per-size
row padding, mobile bottom sheet, both motion rules (motion is disabled in the
run), the state/status axes enumeration, dropdown-menu item variants (types +
anatomy — not wired in the single-select field), the autocomplete keyboard
variant, and max-visible-options scrolling.

## Summary

- 8 rules directly tested (trigger white surface, radius 8px, per-size trigger
  heights XXL 56 / XL 44 / L 32, XL default, `aria-required`, `aria-expanded` +
  `aria-labelledby`, ENTER/ESC open-close, dropdown overlay renders options).
- 2 code/spec divergences (helper color, status helper defaults).
- 15 rules tracked as `it.todo` (14 harness/spec-gap, 1 divergence).
- 3 rules left to design-system governance, not the component.
- Coverage: `yarn check:spec-coverage` confirms all 23 testable SEL rules are
  referenced, all 3 governance rules have none, and `select.rules.md` is not
  stale relative to `md_design/select.md`.
