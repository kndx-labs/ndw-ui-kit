# Button spec-conformance tests — design

Date: 2026-08-31
Status: approved in brainstorming, pending implementation plan
Pilot component: `button` (`md_design/button.md` → `NdwuButtonComponent`)

## 1. Goal

Turn `md_design/*.md` design specifications into an executable conformance
suite for ndw-ui-kit, starting with `button`.

Two deliverables:

1. **Conformance signal** — does the implementation match the specification?
   A failing test is a *finding*, not a broken test. The specs declare Figma as
   their source of truth, so divergence from ndw-ui-kit is expected and is the
   point of the exercise.
2. **Specification review** — is the markdown specification itself good enough
   to test against? Every rule that cannot be turned into a test is recorded as
   a blank (`it.todo`) test naming the reason. That list is the spec-improvement
   backlog.

## 2. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Suite purpose | Conformance audit | Red tests are findings; suite is not expected green on day one. |
| Visual/geometric rules | Real browser runner | jsdom has no layout engine and only partial `getComputedStyle`; heights, min-widths, radii and token colors are unassertable there. |
| Scope | Button pilot, then roll out | Prove harness, conventions and findings format before repeating on dialog, drawer, select. |
| Traceability | Rule IDs added to spec markdown | A failure must name one spec line. IDs survive rewording; quoted prose does not. |
| Unspecified / untestable rules | Blank `it.todo` tests | A rule with no test must still be visible in every run. Silence reads as coverage. |
| Suite structure | Hand-written specs + ID coverage script | Frontmatter-driven generation covers only the smallest, most stable part of the spec and turns parser bugs into apparent component failures. |
| Test location | `ndw-ui-kit/src/tests/` | User constraint. Only `angular.json`, `package.json` and the spec markdown change outside it. |

## 3. Runner architecture

### Dependencies

Add to `devDependencies`:

- `@vitest/browser` (must match `vitest` 3.2.7)
- `playwright`

`@angular/build:unit-test` requires `@vitest/browser` plus one of
`playwright` / `webdriverio` when `browsers` is set
(`node_modules/@angular/build/src/builders/unit-test/builder.js:260`).

Playwright here is only the browser provider vitest drives. No Playwright test
runner, no `page.goto`, no Playwright spec format. Tests remain Angular TestBed
plus vitest.

### Targets

Two test targets, no glob overlap:

```jsonc
// playground.architect
"test": {                                  // unchanged: jsdom, util specs in src/lib
  "options": { "include": ["../lib/**/*.spec.ts"] }
},
"test-conformance": {
  "builder": "@angular/build:unit-test",
  "options": {
    "buildTarget": "playground:build:test",
    "runner": "vitest",
    "browsers": ["ChromiumHeadless"],
    "include": ["../tests/**/*.spec.ts"],
    "tsConfig": "tsconfig.spec.json",
    "providersFile": "src/tests/test-providers.ts"
  }
}
```

Globs resolve relative to `sourceRoot` (`src/playground`), so `../tests` is
`src/tests`. `ChromiumHeadless` normalizes to provider `chromium` with
`headless: true` (`builder.js:269`).

Note the path asymmetry: `include` resolves relative to `sourceRoot`, while
`providersFile` is joined to the **workspace root** (`options.js:56`). Hence
`../tests/**` for one and `src/tests/…` for the other. Both read from the
builder source rather than inferred.

`package.json`: `"test:conformance": "ng run playground:test-conformance"`.
`yarn test` keeps its current meaning.

### Theme injection

The unit-test builder injects only the global stylesheet named `styles.css`
(`builder.js:220`, with a literal `TODO: Expand this to all configured global
stylesheets`). The playground declares two global styles; the design tokens live
in `src/playground/styles/ndw-ui-kit-theme.scss`, which would compile to
`ndw-ui-kit-theme.css` and never be injected.

Component styles reference tokens indirectly — `colors.$gray-40` is
`var(--ndwu-color-gray-40)` — so without the theme every colour assertion reads
empty.

Fix: a `test` build configuration that gives both style entries the same
`bundleName`, so they compile into one injected `styles.css`:

```jsonc
// playground.architect.build.configurations
"test": {
  "optimization": false,
  "sourceMap": true,
  "styles": [
    {"input": "src/playground/styles/ndw-ui-kit-theme.scss", "bundleName": "styles"},
    {"input": "src/playground/styles.scss", "bundleName": "styles"}
  ]
}
```

`bundleName` is supported by `@angular/build:application`
(`schema.json` → `styles.items.oneOf[0]`).

### TypeScript

`tsconfig.spec.json` includes `["src/**/*.d.ts", "src/**/*.spec.ts"]` and
inherits `paths`. Spec files are covered, but the helpers are **not**: `mount.ts`,
`styles.ts`, `tokens.ts` and `test-providers.ts` are not `*.spec.ts`, so they
fall outside the TypeScript program — and `mount.ts` declares an Angular host
component that must be part of the compilation. `include` therefore gains
`"src/tests/**/*.ts"`.

Tests import through `@ndw-ui-kit/core` — the public surface, which is what the
specification describes. `NdwuButtonComponent` is reachable there
(`public-api.ts` → `core/components/index.ts:3`). The l10n providers are **not**
in `public-api.ts`; `test-providers.ts` imports
`provideNdwUiKitNoopTranslation` from `@ndw-ui-kit/core/l10n`.

## 4. Rule IDs

### Format

`{COMP}-{SEC}-{NN}`, placed immediately after the rule's tag:

```markdown
- **[CODE]** (BTN-LAY-04) Each size has a **minimum button width** — XXL 120, XL 96, L 64, S 48 px.
```

- `COMP` — `BTN`, `DLG`, `DRW`, `SEL`. Declared as `ruleIdPrefix: BTN` in the
  spec frontmatter so tooling reads it rather than guessing.
- `SEC` — `CLR` colors, `TYP` typography, `LAY` layout, `ELV` elevation,
  `SHP` shapes, `VAR` variants, `CMP` composition, `STA` states,
  `ACC` accessibility, `DOD` do's and don'ts.
- `NN` — sequential within the section, in document order at time of assignment.

### Rules

- **IDs are permanent.** A rule added later takes the next free number in its
  section even if it sits mid-document. Renumbering invalidates every test name
  and every recorded finding.
- **Every tagged rule gets an ID, including `[DS]` rules.** Their tests are
  blank by design; without an ID the report cannot distinguish "not enforceable
  by a component" from "nobody covered this".
- **Tables get one ID** on the sentence introducing them. Tests iterate rows
  under it. Four IDs for four radius rows add no information.
- **Legend entries get no ID.** They define the tags, they are not rules. This
  is also how tooling tells them apart.
- A four-line note in the Legend section documents the format and the
  never-renumber rule for future editors.

### Markdown shapes the parser must handle

The spec uses more than one bullet shape:

- tag-first: `- **[CODE]** (BTN-LAY-04) …`
- tag-late: `- **Primary** — **[DS]** (BTN-VAR-02)`
- tag with qualifier: `- **[CODE] caveat** (BTN-ACC-05) …`
- tag inline in prose: `Providing the variants is **[CODE]** (BTN-VAR-01); …`

Parsing rule: a rule exists wherever a tag is followed by `(ID)`. Legend
entries carry no ID and drop out naturally.

## 5. File layout

```
src/tests/
  test-providers.ts                 # default-exports provideNdwUiKitNoopTranslation()
  setup.ts                          # theme wait + motion suppression + fixture teardown
  helpers/
    mount.ts                        # mountButton() host harness
    styles.ts                       # computed-style reads, hexToRgb()
    tokens.ts                       # cssVar() + theme guard
  tools/
    check-spec-coverage.ts          # md IDs <-> test IDs, exit 1 on drift
  docs/
    2026-08-31-button-spec-conformance-design.md
  button/
    button.geometry.spec.ts         # LAY, SHP, TYP  — static computed reads
    button.appearance.spec.ts       # CLR, ELV       — tokens, hover, focus
    button.behavior.spec.ts         # STA, CMP, VAR  — DOM structure, inputs
    button.a11y.spec.ts             # ACC
    button.todo.spec.ts             # blank tests: [DS] and [SPEC GAP]
    FINDINGS.md                     # written at end of pilot
```

Specs are grouped by test mechanics rather than by spec section because setup
and flake profile differ: interaction tests need real input events and
transition suppression, static reads need neither. Every `it` still names its
rule ID, so section traceability is preserved without splitting into nine files.

## 6. Harness

### Providers

`NdwuButtonComponent` imports `LocalizePipe`, which injects the abstract
`UiKitTranslationService`. `provideNdwUiKitNoopTranslation()` supplies
`NoopTranslationService`, whose `instant()` returns the key verbatim — so
`label="Save"` renders `Save`. Wired once through the builder's `providersFile`
option rather than repeated per `TestBed`.

### Mount helper

The button selector is an attribute (`button[ndwu-button]`), so a host component
is required.

```ts
mountButton({variant?, size?, disabled?, loading?, icon?, label?, content?})
  => {fixture, host: HTMLButtonElement, styles(): CSSStyleDeclaration}
```

- sets inputs and runs change detection together — specs never call
  `detectChanges()` themselves, so `OnPush` cannot produce stale-DOM failures;
- attaches the fixture to the document so cascade and layout are real;
- deliberately exposes **no** rendered-width getter (see §8.4).

### Style and token helpers

- `styles.ts` — computed-style reads plus `hexToRgb()`. The browser reports
  `rgb(0, 123, 190)` while the spec states `#007bbe`; without normalisation every
  colour test fails on formatting.
- `tokens.ts` — `cssVar(name)` against `document.documentElement`, plus the
  theme guard in §8.1.

### Interaction

- Hover: `userEvent.hover()` from `@vitest/browser/context`, which dispatches
  real input through the Playwright provider rather than synthetic DOM events.
  Synthetic events do not trigger `:hover`.
- Focus ring: real `Tab` keypress, not `element.focus()` (see §8.2).
- Activation: `userEvent.keyboard` for `SPACE` / `ENTER`.

## 7. Rule triage

Every ID belongs to exactly one bucket. Buckets 2 and 3 are blank tests; bucket
4 is discovered by running the suite.

**1 — TESTED.** `[CODE]` or `[DS + CODE]` with a concrete assertable value.
Approximately 23 rules: min-widths 48/64/96/120; heights 24/32/44/56; radii
4/6/8/8; Roboto family; 16/24 and 12/17 with letter-spacing; `white-space:
nowrap`; `XL` default when size unset; 1px border across variants; loading hides
icon and shows loader while the label remains; disabled sets native `disabled`
and `cursor: not-allowed`; loading sets neither `aria-busy` nor `disabled`; no
auto-generated accessible name; `SPACE`/`ENTER` activation; `type="button"`.

**2 — NOT ENFORCEABLE BY THE COMPONENT.** Pure `[DS]`. Approximately 14 rules:
one primary per screen; negative reserved for destructive actions; the size
guide; the account-deletion usage list; the per-variant use/don't-use guidance;
`aria-pressed` ownership. These become `it.todo` under
`describe('[DS] not enforceable by component')` and stay that way — that is the
correct end state, not a gap.

**3 — SPEC GAP.** Tagged `[CODE]` but untestable as written. These become
`it.todo` under `describe('[SPEC GAP] cannot test as written')` and are the
specification-review output. `button.todo.spec.ts` therefore holds three
`describe` blocks — `[DS]`, `[SPEC GAP]`, `[HARNESS LIMIT]` — one per reason a
test is blank, so a blank test always states why. Six spec gaps identified
before implementation:

| Rule | Problem |
|---|---|
| per-size padding | Spec says "its own padding" with no values. The code has them (6px/8px, 8px/12px, 4px/16px, 8px/20px). Nothing to assert against. |
| hover drop-shadow | "Subtle drop-shadow" — no token, no value. Presence is assertable, correctness is not. |
| "buttons otherwise sit flat" | The only untagged rule in the document. Ownership unknown; proposed `[CODE]`. |
| ghost/tertiary border | "Transparent **or** token-driven per state" — two acceptable outcomes, so no single assertion. |
| accessible-name do/don't | Duplicates the accessibility rule. Two IDs for one rule invites drift. |
| `positive` / `warning` | Present in Figma, absent from `BUTTON_VARIANT`; the spec flags this unresolved. A test would be red by declaration. |

**4 — CODE DIVERGENCE.** Test written, spec correct, implementation differs.
Count unknown until the first run. This is the audit result.

A fifth label, **HARNESS LIMIT**, is reserved for rules that are well specified
but not reachable by this tooling — currently only the `pressed` (`:active`)
state (§8.5). It is kept distinct from SPEC GAP so the specification is not
blamed for a tooling shortfall.

### Proposed spec edits beyond ID insertion

Two rules should be split so each ID carries one assertable claim:

1. "Each size has a fixed height … and its own padding and border radius" —
   split into a heights rule (values given, testable) and a padding rule
   (values missing, SPEC GAP).
2. "All variants use a 1px border; ghost/tertiary render it transparent or
   token-driven per state" — split into the 1px rule (testable) and the
   ghost/tertiary rule (SPEC GAP).

These are proposals, raised for approval rather than applied silently.

## 8. Failure modes and guards

**8.1 Missing theme.** If style bundling is wrong, every `var(--ndwu-*)` resolves
empty and roughly fifteen colour tests fail while pointing at the component.
`tokens.ts` asserts `--ndwu-color-brand-50` is non-empty at module load and
throws `theme stylesheet not injected`. One accurate error instead of fifteen
misleading ones.

**8.2 `:focus-visible`.** The button styles both `:focus` and `:focus-visible`
(`ndwu-button.mixins.scss:53,59`). Chromium decides `:focus-visible` from a heuristic about the last input
modality, so `element.focus()` does not reliably match it — a button focused
programmatically after no interaction does not, and focus-ring assertions would
fail against correct code. The behaviour is heuristic, not a hard rule, which
makes it worse: such a test can pass in one ordering and fail in another.
Focus-ring tests press a real `Tab`.

**8.3 Transitions.** The base style declares `transition`
(`ndwu-button.mixins.scss:19`), so a colour read immediately after hover returns
a mid-flight interpolation. A setup stylesheet disables all transitions and
animations. The button spec has no motion rules, so nothing is lost; `select`
(150ms/200ms motion rules) will opt out per-file when it lands.

**8.4 Fonts.** Roboto is served from `/assets/fonts/roboto` and is unlikely to be
available to the test page, changing rendered text width. Minimum-width rules
therefore assert the computed `min-width` property, never `offsetWidth` or
`getBoundingClientRect()`. Heights are CSS-fixed and unaffected. The harness
enforces this by exposing no width getter.

**8.5 `:active`.** The pressed state applies only while a pointer is physically
held, which the tooling cannot reliably hold across an assertion. Attempted
once; if unstable it becomes a HARNESS LIMIT blank test rather than a flaky one.

**8.6 OnPush.** Inputs are set through the harness, which also triggers change
detection, so no spec can produce a stale-DOM failure by forgetting it.

**8.7 `letter-spacing: normal` is not `0px`.** The spec assigns `letterSpacing L`
(`0`) to sizes `L` and `S`. The code applies `letter-spacing` only in the `XL`
and `XXL` blocks (`ndwu-button.mixins.scss:110,117`), so `L`/`S` inherit the
initial value and `getComputedStyle` returns `normal`, not `0px`. Visually
identical, textually different. The assertion accepts `normal` or `0px` as
satisfying "0", and the discrepancy is recorded as a finding rather than
silently normalised away — the token `--ndwu-letterSpacing-L` exists and is
`0px`, so whether the component should apply it explicitly is a real question
for the kit.

**8.8 No retries.** No `retry` configuration. A flaky test is a finding about
the harness or the component, not something to average away.

## 9. Coverage tooling

`src/tests/tools/check-spec-coverage.ts`, run through `tsx` and exposed as
`"check:spec-coverage"`.

1. Parse the spec markdown into `{id, tag, text}` for every tag followed by an ID.
2. Scan `src/tests/**/*.spec.ts` for IDs in test names, recording
   `test` vs `todo` and the file.
3. Exit 1 on any of:
   - an ID in the spec with no test anywhere — a rule went silent;
   - an ID in a test that no longer exists in the spec — a stale reference;
   - a tagged rule outside the Legend carrying no ID — a rule escaped the scheme.
4. Print `ID · tag · kind · file`.

No browser, no test execution, sub-second. Safe to run on every commit.

The spec directory (`md_design/`) is outside the repository. The script defaults
to `../md_design` and accepts an override argument. If the layout changes it
fails loudly rather than reporting zero rules.

Note: the script is a Node script inside a browser-library source tree, which
`eslint`'s `src/**/*.ts` patterns also lint. If it conflicts with
`eslint-plugin-compat` or import rules, the resolution is an override block —
decided at the wiring gate, not worked around silently.

### No findings generator

Specification gaps are already the `[SPEC GAP]` describe block; code divergences
are already red tests naming their rule ID. A generator merging vitest JSON into
a third document would restate both and go stale. `FINDINGS.md` is written once
by hand at the end of the pilot: what failed, what it means, and fix-code
versus fix-spec per item. If repeated runs prove a generator is wanted, it gets
built then against real requirements.

## 10. Verification gate

Before any conformance test is written, one throwaway spec must prove the
wiring:

1. mount a button, assert `getComputedStyle(host).height === '44px'` — proves
   real layout and the default-size path;
2. assert `--ndwu-color-brand-50` resolves non-empty — proves theme injection;
3. confirm `@ndw-ui-kit/core` imports resolve under `tsconfig.spec.json`.

If any step fails, the runner configuration is fixed before tests are written.
Discovering broken wiring after forty tests exist means forty ambiguous
failures.

## 11. Out of scope

- `dialog`, `drawer`, `select` — pilot first, roll out after the format proves
  useful. `select.md` spans several kit components (form-field, styled-dropdown,
  styled-listbox, aria/combobox, aria/listbox); `dialog.md` and `drawer.md` both
  map onto the shared `modal` subsystem. Those mappings are resolved at rollout.
- Icon-only buttons — `button.md` scopes them out explicitly (frontmatter
  `omitted`, and the Overview source note).
- `NdwuTimingButtonComponent` and `NdwuIconButtonComponent` — no specification
  document exists for either, so there is nothing to audit them against. Out of
  scope by absence, not by the spec's own exclusion.
- Visual regression / screenshot diffing.
- Fixing any divergence the audit finds. Findings are reported; remediation is a
  separate decision.

## 12. Open items

- `md_design/` is unversioned and sits outside `ndw-ui-kit`, so a commit inside
  the kit will not capture the rule-ID edits. Raised; deferred by the user.
- Exact count of bucket-4 divergences is unknown until first run. If the volume
  makes the suite unreadable, the fallback is splitting into a green regression
  suite plus a separate conformance suite.
- The two proposed rule splits in §7 need approval before the spec is edited.
