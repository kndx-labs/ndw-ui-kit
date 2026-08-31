# Button spec conformance — findings

Spec: `md_design/button.md` · Component: `NdwuButtonComponent`
Run: 2026-08-31 · 52 passed · 2 failed · 19 todo (73 total)

## Code divergences — implementation differs from the specification

| Rule | Expected (spec) | Actual (code) | Recommendation |
|---|---|---|---|
| BTN-DOD-04 | Native `<button type="button">`, so it never submits an enclosing `<form>`. | `NdwuButtonComponent`'s host metadata sets `'attr.type': 'button'` — an **unbracketed** key. Angular only treats `[attr.x]`/`(x)`-bracketed keys as bindings; an unbracketed key is applied as a literal static attribute. The rendered element carries an attribute literally named `attr.type`, never `type`. The real `type` attribute is absent, so the IDL `.type` property defaults to `"submit"`. A button used inside a real `<form>` would submit it on click. | **Fix code.** Change the host metadata key from `'attr.type': 'button'` to `'[attr.type]': "'button'"` (or, since the value is a fixed constant, the plain unbracketed `'type': 'button'`, which Angular does apply as a static attribute). Either form fixes the bug; the current one does not. |
| BTN-ELV-02 | `fx-focused-primary` = focus colour drop-shadow spread **3**, plus white spread 1 (`ndwu-button.tokens.scss`/Figma tokens as described in the spec). | The actual token renders `inset 0 0 0 1px white, 0 0 0 2px brand` — spread **2**, identical to `fx-focused-default`'s spread, differing only by the added white inset. | **Fix spec or code**, pick one. Either the design intends the primary ring to be visually louder than default (spread 3, not 2) and the token is wrong, or the token is correct and the spec's spread value is stale. This is a design-system judgment call the component conformance suite can't make — flag to whoever owns `focus-tokens.scss` / the Figma source. |

## Specification defects — rules that could not be tested

| Rule | Problem | Suggested spec edit |
|---|---|---|
| BTN-LAY-05 | States "each size has its own padding" with no values. | Add the four value pairs the code already uses (`ndwu-button.mixins.scss`): S `6px 8px`, L `8px 12px`, XL `4px 16px`, XXL `8px 20px`. |
| BTN-ELV-01 | "Subtle drop-shadow (filter)" with no token or value. | State the value, or name a token: the code uses `filter: drop-shadow(1px 1px 2px -1px #00000024)`. |
| BTN-SHP-03 | "Ghost/tertiary render the border transparent **or** token-driven per state" — two acceptable outcomes, neither assertable. | Pick one per variant/state, or split into per-variant sub-rules the way BTN-SHP-02 (the shared 1px-border rule) was already split out from this one during the rule-ID pass. |
| BTN-DOD-03 | Duplicates BTN-ACC-01 ("give a text-less button an accessible name") word-for-word in intent. Two IDs for one rule risks the two drifting apart on a future edit. | Turn BTN-DOD-03 into a cross-reference to BTN-ACC-01 rather than a restated rule. |
| BTN-DOD-05 | Figma defines `positive`/`warning` statuses; `BUTTON_VARIANT` doesn't expose them. The spec already flags this as an open item, so it's not a new finding — recorded here only so it appears in the same coverage sweep as the others. | No spec edit needed; this is a pending product decision, not a documentation gap. |

## Not enforceable by the component

13 `[DS]` rules — BTN-CLR-03, BTN-LAY-01, BTN-VAR-02..09, BTN-ACC-02, BTN-DOD-01, BTN-DOD-02 — listed as `it.todo` in `button.todo.spec.ts`. These are usage/governance guidance (which variant for which purpose, one primary per screen, when `negative` is warranted) that a component cannot itself know or enforce. No action; recorded so their absence of a test is never mistaken for missing coverage.

## Harness limits

| Rule | Limit |
|---|---|
| BTN-STA-01 (`pressed`) | `:active` only applies while a pointer is physically held down. Tried twice: a synthetic `PointerEvent('pointerdown')` after `userEvent.hover()` first appeared to pass, but that was because it was really re-detecting hover's own colour change (comparing against *resting*, not *hovered*, background). Corrected to compare *hovered* vs *post-pointerdown* and it failed consistently across 3 runs — a dispatched `PointerEvent` does not engage Chromium's real `:active` state. No tooling in this suite can hold a pointer down across an assertion. |

## Editorial fixes made while assigning rule IDs (Task 3–4)

Not conformance findings, but worth recording since they changed the spec text:

- Split "each size has a fixed height ... and its own padding and border radius" into a height rule (BTN-LAY-04, has values) and a padding rule (BTN-LAY-05, doesn't — see above).
- Split "all variants use a 1px border; ghost/tertiary render it transparent or token-driven" into BTN-SHP-02 (1px border, testable) and BTN-SHP-03 (the "or", not testable — see above).
- Tagged "buttons otherwise sit flat on the surface" (BTN-ELV-03) — it was the only rule in the document with no `[CODE]`/`[DS]`/`[DS + CODE]` tag at all.
- Dropped the tag from two section headings ("### Composition", "### States") that were purely restating the tag already carried by every child bullet underneath — not separate rules, and giving them placeholder IDs would have created two IDs with no distinct claim.

## Summary

- 24 rules directly tested (22 with a passing test, plus BTN-STA-01 and BTN-ACC-01, each of which has a passing test *and* a `[DS]`/harness-limit sub-clause tracked separately as a todo) — 52 passing assertions in total across geometry/appearance/behaviour/a11y, including `it.each` coverage across sizes and variants.
- 2 real divergences between code and spec (1 accessibility/form-safety bug, 1 design-token discrepancy).
- 5 rules the spec can't currently be tested against, each with a concrete suggested edit.
- 13 rules correctly left to design-system governance, not the component.
- 1 rule (`pressed`) the tooling itself can't reach.
- Coverage is exhaustive: `yarn check:spec-coverage` confirms all 42 rule IDs in `md_design/button.md` are referenced by a test or a todo, and no test references an ID the spec doesn't have.
