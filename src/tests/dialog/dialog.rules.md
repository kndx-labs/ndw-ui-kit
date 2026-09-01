# Dialog — Test Rule Extraction

Generated from `md_design/dialog.md` (version: alpha) by
`src/tests/tools/generate-rule-spec.ts`. Do not hand-edit — rerun the
generator instead. The generator refuses to run if `dialog.md` no longer
matches the hash its extraction tables were reviewed against; `yarn
check:spec-coverage` also fails if this file drifts from a fresh run.

## Legend

- **[CODE]** / **[DS + CODE]** — in scope for a real test.
- **[DS]** — out of scope: design-system governance a single component
  test cannot verify. Listed for traceability, not tested.

## Colors (CLR)

- **DLG-CLR-01** `[CODE]` (dialog.md:67) — Dialog surface is the base white surface (`global-color-gray-0` `#ffffff`); the backdrop dims the...
- **DLG-CLR-02** `[DS + CODE]` (dialog.md:69) — Footer action buttons follow the Button spec; the primary action uses the primary button color.

## Typography (TYP)

- **DLG-TYP-01** `[CODE]` (dialog.md:74) — Default title uses `desktop/H3-desktop` — Roboto Medium 25 / line height 34. On mobile the title ...

## Layout (LAY)

- **DLG-LAY-01** `[DS + CODE]` (dialog.md:82) — The **primary button is always on the right** of the footer. The container right-aligns the deskt...
- **DLG-LAY-02** `[DS + CODE]` (dialog.md:85) — For forms **narrower than 400px**, footer buttons span the full window width (100%). On handset t...
- **DLG-LAY-05** `[DS + CODE]` (dialog.md:94) — Max **height 90%**, max **width 80%** of the viewport; the **minimum size is determined by the co...
- **DLG-LAY-06** `[CODE]` (dialog.md:103) — On handset the dialog becomes full-screen, bottom-aligned, with safe-area insets; bottom corners ...

## Elevation & Depth (ELV)

- **DLG-ELV-01** `[CODE]` (dialog.md:115) — The dialog sits above the page on an overlay with a dimming backdrop; page scrolling is locked wh...

## Shapes (SHP)

- **DLG-SHP-01** `[CODE]` (dialog.md:122) — Corner radius scales with the size set:

## Components (CMP)

- **DLG-CMP-01** `[DS + CODE]` (dialog.md:134) — Use a modal when you need **immediate feedback from the user in the context of the current task**...

## Behavior (BHV)

- **DLG-BHV-01** `[CODE]` (dialog.md:150) — Dismissal paths: backdrop click, `ESC`, and the close button. A `disableClose` option turns off b...
- **DLG-BHV-02** `[CODE]` (dialog.md:152) — Large content scrolls within the body scroll area (see Do/Don't).
- **DLG-BHV-03** `[DS + CODE]` (dialog.md:153) — Footer buttons are optional; a modal with no buttons renders no footer.

## Accessibility (ACC)

- **DLG-ACC-01** `[CODE]` (dialog.md:158) — Root uses `tabindex="-1"`, `role="dialog"`, and `aria-modal="true"`.
- **DLG-ACC-02** `[DS + CODE]` (dialog.md:160) — `aria-labelledby` and `aria-describedby` connect the accessible name/description. The container w...
- **DLG-ACC-03** `[CODE]` (dialog.md:164) — Keyboard: focus is trapped and cycles with **`TAB`** / **`SHIFT + TAB`**; **`ESC`** closes the wi...

## Do's and Don'ts (DOD)

- **DLG-DOD-04** `[DS + CODE]` (dialog.md:179) — Do use vertical scroll within the body scroll area; the container makes the body scrollable. Don'...

## Design-system governance — out of scope

Pure `[DS]` rules. Listed for traceability; none of these get a test.

- **DLG-TYP-02** `[DS]` (dialog.md:76) — Body copy should stay short — Task modals cap at ~2 paragraphs.
- **DLG-LAY-03** `[DS]` (dialog.md:87) — Input and select fields always scale to **100%** of the window width. This is the consumer's form...
- **DLG-LAY-04** `[DS]` (dialog.md:89) — When composing, use components from a **single size set** (XXL, XL, L) — don't mix size sets in o...
- **DLG-LAY-07** `[DS]` (dialog.md:109) — Desktop: if the dialog would contain **only one input field**, show it on the page as an inline c...
- **DLG-ELV-02** `[DS]` (dialog.md:117) — The dialog is above the main screen content level; links inside it should open in a new browser tab.
- **DLG-CMP-02** `[DS]` (dialog.md:137) — Documented use cases: action confirmation, sign up, sign in, adding a network, adding devices, ot...
- **DLG-CMP-03** `[DS]` (dialog.md:143) — The window content is not related to the current task's context.
- **DLG-CMP-04** `[DS]` (dialog.md:144) — The content is complex and belongs on a separate page/screen (see the Task limits above).
- **DLG-CMP-05** `[DS]` (dialog.md:146) — Don't use a dialog in place of Snackbar / Toast-style notifications.
- **DLG-DOD-01** `[DS]` (dialog.md:170) — Do focus on simple scenarios and short messages; don't overload the modal with information.
- **DLG-DOD-02** `[DS]` (dialog.md:172) — Don't use complex scenarios that confuse users — move that content to a new page instead.
- **DLG-DOD-03** `[DS]` (dialog.md:174) — Don't overlap / stack modal windows on top of each other. - **Open item for ndw-ui-kit:** the lib...

## Untagged bullets — spec defect

Bullets with no `[CODE]`/`[DS]`/`[DS + CODE]` tag in the source. Not
classified, not tested.


## Untestable as written — spec defect

Tagged rules that can't produce a single clean assertion because the
spec omits a value.


## Ambiguous or duplicate bullets

Tagged rules that can't produce a single clean assertion because they
state two acceptable outcomes, or restate another rule.

