# Select — Test Rule Extraction

Generated from `md_design/select.md` (version: alpha) by
`src/tests/tools/generate-rule-spec.ts`. Do not hand-edit — rerun the
generator instead. The generator refuses to run if `select.md` no longer
matches the hash its extraction tables were reviewed against; `yarn
check:spec-coverage` also fails if this file drifts from a fresh run.

## Legend

- **[CODE]** / **[DS + CODE]** — in scope for a real test.
- **[DS]** — out of scope: design-system governance a single component
  test cannot verify. Listed for traceability, not tested.

## Colors (CLR)

- **SEL-CLR-01** `[CODE]` (select.md:61) — Trigger surface is the base white surface; helper text uses the form helper color (`#6a6f7c`).
- **SEL-CLR-02** `[DS + CODE]` (select.md:63) — Status recolors the field: `negative` (`#e0031f`) and `positive` for validation feedback; `defaul...

## Typography (TYP)

- **SEL-TYP-01** `[CODE]` (select.md:68) — Trigger and option text use the form/Roboto scale sized per the field size (L uses the smaller st...

## Layout (LAY)

- **SEL-LAY-01** `[CODE]` (select.md:76) — Supported sizes and the number of option rows visible before the menu scrolls:
- **SEL-LAY-02** `[DS + CODE]` (select.md:85) — `XL` is the default field size.
- **SEL-LAY-03** `[CODE]` (select.md:94) — Desktop: maximum option width **640px**; text is a single line and truncates with an ellipsis bey...
- **SEL-LAY-04** `[CODE]` (select.md:98) — Mobile: option text may wrap to **at most 2 lines**, then truncates with an ellipsis.
- **SEL-LAY-05** `[DS + CODE]` (select.md:101) — Grouping / row padding per size
- **SEL-LAY-06** `[CODE]` (select.md:114) — On mobile the menu is a bottom sheet; **an extra 4px of internal padding** is added versus desktop.

## Elevation & Depth (ELV)

- **SEL-ELV-01** `[CODE]` (select.md:119) — The dropdown menu is an overlay above the field. Desktop anchors to the trigger with a bordered, ...

## Shapes (SHP)

- **SEL-SHP-01** `[CODE]` (select.md:125) — The trigger uses the form control radius (`8px` at XL). The desktop menu panel is rounded; the mo...

## Motion (MOT)

- **SEL-MOT-01** `[CODE]` (select.md:130) — Label animation is **200ms**; other animations are **150ms** with `cubic-bezier(0.2, 0, 0.38, 0.9)`.
- **SEL-MOT-02** `[DS + CODE]` (select.md:132) — Honour `prefers-reduced-motion: reduce`.

## Components (CMP)

- **SEL-CMP-01** `[CODE]` (select.md:138) — Axes: `state = hover, focused, pressed, disabled` (plus `placeholder` and `default`); `status = d...
- **SEL-CMP-02** `[CODE]` (select.md:142) — A `mandatory` (required) field shows a required marker and exposes `aria-required`; it does not a...
- **SEL-CMP-03** `[DS + CODE]` (select.md:147) — If an error/success hint is not provided, a default helper text is used (applies to input, select...
- **SEL-CMP-04** `[CODE]` (select.md:156) — Item `type`: single-select, multi-select, link (plus single-select **icon** and multi-select **+ ...
- **SEL-CMP-05** `[DS + CODE]` (select.md:160) — Item anatomy (each toggleable): label text; description on/off; action on/off; alert on/off; left...

## Accessibility (ACC)

- **SEL-ACC-01** `[CODE]` (select.md:175) — ARIA: `aria-label=` (accessible name), `aria-describedby` (helper text), `aria-expanded` (open st...
- **SEL-ACC-02** `[CODE]` (select.md:178) — Keyboard: **`TAB`** focuses the field; **`ENTER` / `SPACE`** open the list; **`ESC`** closes it; ...
- **SEL-ACC-03** `[DS + CODE]` (select.md:181) — Autocomplete variant keyboard model (from the autocomplete panel): **`TAB`** moves to the next op...

## Do's and Don'ts (DOD)

- **SEL-DOD-02** `[DS + CODE]` (select.md:191) — Do respect the max visible options per size (XXL 7 / XL 8 / L 9) and let the list scroll beyond t...
- **SEL-DOD-04** `[DS + CODE]` (select.md:195) — Do honour reduced-motion preferences for the open/label animations.

## Design-system governance — out of scope

Pure `[DS]` rules. Listed for traceability; none of these get a test.

- **SEL-TYP-02** `[DS]` (select.md:70) — Option text is a single line on desktop (see Option width).
- **SEL-DOD-01** `[DS]` (select.md:189) — Do keep option labels to a single line on desktop; rely on the ellipsis rather than growing the row.
- **SEL-DOD-03** `[DS]` (select.md:193) — Do give the field an accessible name — the component does not invent one when both the label and ...

## Untagged bullets — spec defect

Bullets with no `[CODE]`/`[DS]`/`[DS + CODE]` tag in the source. Not
classified, not tested.


## Untestable as written — spec defect

Tagged rules that can't produce a single clean assertion because the
spec omits a value.


## Ambiguous or duplicate bullets

Tagged rules that can't produce a single clean assertion because they
state two acceptable outcomes, or restate another rule.

