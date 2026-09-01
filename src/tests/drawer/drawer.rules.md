# Drawer — Test Rule Extraction

Generated from `md_design/drawer.md` (version: alpha) by
`src/tests/tools/generate-rule-spec.ts`. Do not hand-edit — rerun the
generator instead. The generator refuses to run if `drawer.md` no longer
matches the hash its extraction tables were reviewed against; `yarn
check:spec-coverage` also fails if this file drifts from a fresh run.

## Legend

- **[CODE]** / **[DS + CODE]** — in scope for a real test.
- **[DS]** — out of scope: design-system governance a single component
  test cannot verify. Listed for traceability, not tested.

## Colors (CLR)

- **DRW-CLR-01** `[CODE]` (drawer.md:59) — Drawer surface is the base white surface (`global-color-gray-0` `#ffffff`); the backdrop dims the...
- **DRW-CLR-02** `[DS + CODE]` (drawer.md:61) — Footer action buttons follow the Button spec; the primary action uses the primary button color.

## Typography (TYP)

- **DRW-TYP-01** `[CODE]` (drawer.md:66) — Default title uses `desktop/H3-desktop` — Roboto Medium 25 / 34; on mobile it steps down to Robot...

## Layout (LAY)

- **DRW-LAY-01** `[DS + CODE]` (drawer.md:73) — The **primary button is always on the right** of the footer.
- **DRW-LAY-02** `[DS + CODE]` (drawer.md:74) — For drawers **narrower than 400px**, footer buttons span the full width (100%).
- **DRW-LAY-03** `[CODE]` (drawer.md:79) — Desktop widths: **XL = 700px** (default) and **XXL = 1200px**; the panel fills the full viewport ...
- **DRW-LAY-04** `[CODE]` (drawer.md:81) — **Mobile always uses XL.** Regardless of the size of the form components on desktop, the mobile d...
- **DRW-LAY-05** `[CODE]` (drawer.md:86) — On handset the drawer is full-width (`100vw`), full viewport height with safe-area insets, and no...

## Elevation & Depth (ELV)

- **DRW-ELV-01** `[CODE]` (drawer.md:92) — The drawer sits above the page on an overlay with a dimming backdrop; page scrolling is locked wh...
- **DRW-ELV-02** `[CODE]` (drawer.md:94) — The drawer animates in and out with a horizontal slide (~300ms); the overlay is disposed only aft...

## Shapes (SHP)

- **DRW-SHP-01** `[CODE]` (drawer.md:99) — Desktop drawer is edge-anchored with a header bottom border and a footer top border separating th...

## Components (CMP)

_(no CODE/DS + CODE rules in this section)_

## Behavior (BHV)

- **DRW-BHV-01** `[CODE]` (drawer.md:169) — Dismissal paths: backdrop click, `ESC`, and the close button; a `disableClose` option turns these...
- **DRW-BHV-02** `[CODE]` (drawer.md:171) — Large content scrolls vertically within the body scroll area.
- **DRW-BHV-03** `[DS + CODE]` (drawer.md:172) — Footer buttons are optional; a drawer with no buttons renders no footer.

## Accessibility (ACC)

- **DRW-ACC-01** `[CODE]` (drawer.md:177) — Root uses `tabindex="-1"`, `role="dialog"`, and `aria-modal="true"`.
- **DRW-ACC-02** `[DS + CODE]` (drawer.md:179) — `aria-labelledby` and `aria-describedby` connect the accessible name/description — wired from the...
- **DRW-ACC-03** `[CODE]` (drawer.md:183) — Keyboard: focus is trapped and cycles with **`TAB`** / **`SHIFT + TAB`**; **`ESC`** closes the dr...

## Do's and Don'ts (DOD)

- **DRW-DOD-05** `[DS + CODE]` (drawer.md:197) — Do keep the primary action on the right and let the body scroll vertically for long content.

## Design-system governance — out of scope

Pure `[DS]` rules. Listed for traceability; none of these get a test.

- **DRW-CMP-01** `[DS]` (drawer.md:105) — When to use
- **DRW-CMP-02** `[DS]` (drawer.md:109) — Additional or reference information about an element/object on the page (details of a selected de...
- **DRW-CMP-03** `[DS]` (drawer.md:112) — Simple contextual tasks — e.g. adding or editing form elements that would cause scrolling or usab...
- **DRW-CMP-04** `[DS]` (drawer.md:117) — Action confirmation → use a **modal** instead.
- **DRW-CMP-05** `[DS]` (drawer.md:118) — Complex content: multi-step wizards, dashboards, large tables → use a separate **page**.
- **DRW-CMP-06** `[DS]` (drawer.md:120) — Deep hierarchy (a drawer inside a drawer) → rethink the flow. (The library does not provide a nes...
- **DRW-CMP-07** `[DS]` (drawer.md:123) — Signals — Drawer vs Modal vs Page
- **DRW-CMP-08** `[DS]` (drawer.md:146) — Decision matrix
- **DRW-DOD-01** `[DS]` (drawer.md:190) — Do reach for a drawer when the user stays in a browse loop and wants the underlying list/board co...
- **DRW-DOD-02** `[DS]` (drawer.md:192) — Don't use a drawer for confirmations or destructive actions — use a modal.
- **DRW-DOD-03** `[DS]` (drawer.md:194) — Don't nest a drawer inside a drawer; reconsider the flow.
- **DRW-DOD-04** `[DS]` (drawer.md:195) — Don't push multi-step, single-object wizards or dashboards into a drawer — use a page.

## Untagged bullets — spec defect

Bullets with no `[CODE]`/`[DS]`/`[DS + CODE]` tag in the source. Not
classified, not tested.


## Untestable as written — spec defect

Tagged rules that can't produce a single clean assertion because the
spec omits a value.


## Ambiguous or duplicate bullets

Tagged rules that can't produce a single clean assertion because they
state two acceptable outcomes, or restate another rule.

