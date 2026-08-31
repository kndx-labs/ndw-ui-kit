# Button — Test Rule Extraction

Generated from `md_design/button.md` (version: alpha) by
`src/tests/tools/generate-rule-spec.ts`. Do not hand-edit — rerun the
generator instead. If a fresh run produces a diff, `button.md` changed
and this file is stale.

## Legend

- **[CODE]** / **[DS + CODE]** — in scope for a real test.
- **[DS]** — out of scope: design-system governance a single component
  test cannot verify. Listed for traceability, not tested.

## Colors (CLR)

- **BTN-CLR-01** `[DS + CODE]` (button.md:90) — Each `type` has a full set of color tokens for background, content (text / icon), and stroke, res...
- **BTN-CLR-02** `[CODE]` (button.md:95) — Disabled uses dedicated disabled tokens (`primary-color-bg-disabled` `#797d89`, `primary-color-co...

## Typography (TYP)

- **BTN-TYP-01** `[CODE]` (button.md:103) — Font family is Roboto (`"Helvetica Neue", sans-serif` fallback).
- **BTN-TYP-02** `[CODE]` (button.md:104) — `XXL` and `XL` use `desktop/medium-desktop` — Roboto 16 / line height 24, `letterSpacing S` (−0.1).
- **BTN-TYP-03** `[CODE]` (button.md:106) — `L` and `S` use `desktop/xsmall-desktop` — Roboto 12 / line height 17, `letterSpacing L` (0).
- **BTN-TYP-04** `[CODE]` (button.md:108) — Label text does not wrap (`white-space: nowrap`).

## Layout (LAY)

- **BTN-LAY-02** `[DS + CODE]` (button.md:124) — `XL` is the default size. The design system declares it the default, and the component resolves t...
- **BTN-LAY-03** `[CODE]` (button.md:127) — Each size has a **minimum button width** — XXL 120, XL 96, L 64, S 48 px.
- **BTN-LAY-04** `[CODE]` (button.md:129) — Each size has a fixed height — XXL 56, XL 44, L 32, S 24 px — and its own padding and border radi...

## Elevation & Depth (ELV)

- **BTN-ELV-02** `[CODE]` (button.md:136) — Focus is expressed as a ring via Figma effect tokens: `fx-focused-default` (focus-color drop shad...

## Shapes (SHP)

- **BTN-SHP-01** `[CODE]` (button.md:144) — Border radius scales with size:
- **BTN-SHP-02** `[CODE]` (button.md:153) — All variants use a 1px border; ghost/tertiary render it transparent or token-driven per state.

## Variants (VAR)

- **BTN-VAR-01** `[CODE]` (button.md:160) — From the Figma "Button type guide". Providing the variants is ; the use / don't-use guidance is —...

## Composition (CMP)

- **BTN-CMP-01** `[DS + CODE]` (button.md:205) — A button is composed of an optional **icon image** slot and a **label** slot. ndw-ui-kit renders ...
- **BTN-CMP-02** `[CODE]` (button.md:208) — In the `loading` state the icon is hidden and a loader is shown; the label remains.

## States (STA)

- **BTN-STA-01** `[CODE]` (button.md:213) — The component renders `default`, `hover`, `focused`, `pressed`, `disabled`, and `loading` visual ...
- **BTN-STA-02** `[CODE]` (button.md:215) — `disabled` uses native `disabled` (blocks focus and activation) and the disabled token set with `...
- **BTN-STA-03** `[CODE]` (button.md:217) — `loading` shows the loader, hides the icon, and blocks pointer events; per the implementation it ...

## Accessibility (ACC)

- **BTN-ACC-01** `[DS + CODE]` (button.md:223) — `aria-label` = the button's title. Required for a button with no visible text. ndw-ui-kit preserv...
- **BTN-ACC-03** `[DS + CODE]` (button.md:235) — `tabindex` = an integer. The component uses a native `<button>`, which is focusable by default; d...
- **BTN-ACC-04** `[DS + CODE]` (button.md:238) — Keyboard accessibility must be ensured: **focus via `TAB`**, **activation via `SPACE` / `ENTER`**...
- **BTN-ACC-05** `[CODE]` (button.md:242) — `loading` provides no built-in `aria-busy` or screen-reader status text, and does not block keybo...

## Do's and Don'ts (DOD)

- **BTN-DOD-04** `[CODE]` (button.md:253) — Do rely on the native `<button>` (`type="button"`) so form submission, focus, and `SPACE`/`ENTER`...

## Design-system governance — out of scope

Pure `[DS]` rules. Listed for traceability; none of these get a test.

- **BTN-CLR-03** `[DS]` (button.md:98) — `negative` status color is reserved for risky/destructive actions; do not repurpose it for neutra...
- **BTN-LAY-01** `[DS]` (button.md:112) — Size guide (when to use each size)
- **BTN-VAR-02** `[DS]` (button.md:164) — **Primary** — - Use: for the single most important target action (CTA). Used **once** per screen ...
- **BTN-VAR-03** `[DS]` (button.md:168) — **Secondary** — - Use: for supporting or alternative actions — often Cancel, Back, etc. - Don't: ...
- **BTN-VAR-04** `[DS]` (button.md:171) — **Tertiary** — - Use: for the least important actions, group operations, sub-tasks. May be used o...
- **BTN-VAR-05** `[DS]` (button.md:175) — **Ghost** — - Use: supporting button for safe actions; used as a link analogue. - Don't: for prim...
- **BTN-VAR-06** `[DS]` (button.md:178) — **Negative** (status) — - Use: risky actions with irreversible consequences (e.g. account deletio...
- **BTN-VAR-07** `[DS]` (button.md:182) — **Positive** (status) — - Use: encouraging actions that don't need an immediate reaction (confirm...
- **BTN-VAR-08** `[DS]` (button.md:186) — **Warning** (status) — - Use: a warning that needs the user's attention (no internet, status chan...
- **BTN-VAR-09** `[DS]` (button.md:190) — Negative / critical status usage
- **BTN-ACC-02** `[DS]` (button.md:228) — `aria-pressed` = `true` / `false`. `aria-pressed` is the ARIA attribute for a *toggle button* — o...
- **BTN-DOD-01** `[DS]` (button.md:248) — Do use exactly one `primary` button per screen or modal.
- **BTN-DOD-02** `[DS]` (button.md:249) — Don't use `tertiary` or `negative` styling as the affordance for a frequent/important action; don...
- **BTN-DOD-05** `[DS]` (button.md:255) — **Open item for ndw-ui-kit:** Figma defines `positive` and `warning` statuses that are not curren...

## Untagged bullets — spec defect

Bullets with no `[CODE]`/`[DS]`/`[DS + CODE]` tag in the source. Not
classified, not tested.

- (button.md:140) "Buttons otherwise sit flat on the surface; there is no resting elevation." — no tag in the source.

## Untestable as written — spec defect

Tagged rules that can't produce a single clean assertion because the
spec omits a value.

- **BTN-LAY-05** `[CODE]` (button.md:129) — per-size padding: no values stated (code has 6/8, 8/12, 4/16, 8/20)
- **BTN-ELV-01** `[CODE]` (button.md:134) — hover drop-shadow: "subtle", no token or value given

## Ambiguous or duplicate bullets

Tagged rules that can't produce a single clean assertion because they
state two acceptable outcomes, or restate another rule.

- **BTN-SHP-03** `[CODE]` (button.md:153) — ghost/tertiary border "transparent OR token-driven": two acceptable outcomes
- **BTN-DOD-03** `[DS + CODE]` (button.md:251) duplicates **BTN-ACC-01** — the accessible-name rule stated twice
