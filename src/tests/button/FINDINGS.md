# Button spec conformance — findings

Spec: `md_design/button.md` · Component: `NdwuButtonComponent`
Run: 2026-09-01 · 51 passed · 2 failed · 5 todo (58 total)

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

## Not enforceable by the component

14 `[DS]` rules — BTN-CLR-03, BTN-LAY-01, BTN-VAR-02..09, BTN-ACC-02, BTN-DOD-01, BTN-DOD-02, BTN-DOD-05 — listed in `button.rules.md`'s "Design-system governance" section, not in the test suite at all. These are usage/governance guidance (which variant for which purpose, one primary per screen, when `negative` is warranted, the open item on exposing `positive`/`warning`) that a component cannot itself know or enforce. No action; recorded so their absence of a test is never mistaken for missing coverage.

## Harness limits

| Rule | Limit |
|---|---|
| BTN-STA-01 (`pressed`) | `:active` only applies while a pointer is physically held down. Tried twice: a synthetic `PointerEvent('pointerdown')` after `userEvent.hover()` first appeared to pass, but that was because it was really re-detecting hover's own colour change (comparing against *resting*, not *hovered*, background). Corrected to compare *hovered* vs *post-pointerdown* and it failed consistently across 3 runs — a dispatched `PointerEvent` does not engage Chromium's real `:active` state. No tooling in this suite can hold a pointer down across an assertion. |

## Rule-extraction decisions made by the generator

`md_design/button.md` is never modified; these decisions live entirely in
`src/tests/tools/generate-rule-spec.ts` and are re-derived every time it runs:

- Lines 129 and 153 each state two independently-checkable claims in one
  bullet. Both produce two IDs: `BTN-LAY-04`/`BTN-LAY-05` (height, tested;
  padding, no values given) and `BTN-SHP-02`/`BTN-SHP-03` (1px border,
  tested; ghost/tertiary either-or, not assertable).
- Line 140 ("buttons otherwise sit flat...") has no tag at all in the source
  — the generator does not invent one, so this rule has no ID and no test.
  This is a real coverage loss versus the original pilot, which had tagged
  and tested it as `BTN-ELV-03`.
- Two heading tags (`### Composition — [DS + CODE]`, `### States — [CODE]`)
  are skipped — the very next line after each is already a tagged bullet, so
  the heading tag restates what its children already state and doesn't get
  its own ID.
- Line 255 (the `positive`/`warning` open item) doesn't start with a leading
  tag marker like every other bullet; the generator takes the first `[TAG]`
  it finds in the bullet's text (`[DS]`, before the later inline `[CODE]`
  mention) as the classifying tag, landing it in governance as `BTN-DOD-05`.

## Summary

- 23 rules directly tested (21 with a passing test, plus `BTN-STA-01` and
  `BTN-ACC-01`, each of which has a passing test *and* a
  harness-limit/cross-reference sub-clause tracked separately as a todo) —
  across geometry/appearance/behaviour/a11y, including `it.each` coverage
  across sizes and variants.
- 2 real divergences between code and spec (1 accessibility/form-safety bug,
  1 design-token discrepancy) — unchanged from the original pilot.
- 4 rules the spec can't currently be tested against (2 missing a value, 2
  either/or-or-duplicate), each with a concrete suggested edit.
- 14 rules correctly left to design-system governance, not the component —
  listed only in `button.rules.md`, not in the test suite.
- 1 rule (`pressed`) the tooling itself can't reach.
- 1 rule (`BTN-ELV-03`, resting elevation) lost coverage in this redesign: its
  source bullet has no tag, and rule IDs are no longer assigned by editorial
  judgment — only mechanically, from what the source actually states.
- Coverage is exhaustive: `yarn check:spec-coverage` confirms all 41 rule IDs
  in the generated `button.rules.md` are referenced by a test or a todo, and
  no test references an ID `button.rules.md` doesn't have. `button.rules.md`
  is also verified not stale relative to `md_design/button.md` on every run.
