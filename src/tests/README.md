# Component conformance tests

Real-browser tests that check each component's **code** against its **designer
markdown spec** in `md_design/*.md`. A failing test is a finding — a genuine
divergence between code and spec — not a broken test. See
[ADR 009](../../docs/architecture/ADR/009-testing-against-markdown-only-specs.md)
for the why.

## Running

Run everything from the `ndw-ui-kit/` directory.

```bash
yarn test:conformance     # the component conformance specs (headless Chromium)
yarn check:spec-coverage  # gate: every spec rule has a test or an it.todo
yarn test                 # the pre-existing lib unit tests (jsdom) — NOT these specs
```

- `yarn test:conformance` runs `src/tests/**/*.spec.ts` in real Chromium via
  `@vitest/browser` + Playwright. First run on a fresh machine needs the browser
  binary once: `npx playwright install chromium`.
- `yarn test` runs a different, jsdom suite (`src/lib/**/*.spec.ts`). It does
  **not** include these conformance specs — use `yarn test:conformance` for them.
- Expect a small number of `it.todo` (rules the harness can't reach yet) and the
  divergences recorded in each `FINDINGS.md` — those are intentional, documented.

## The rule pipeline

```
md_design/<c>.md   designer spec; bullets tagged [CODE] / [DS] / [DS + CODE]
      │  yarn generate:rules
      ▼
<c>/<c>.rules.md   generated rule list, each rule an id like DLG-CLR-01
      │  specs reference rule ids in their test titles
      ▼
<c>/*.spec.ts      real tests for measurable rules; it.todo for the rest
      │  yarn check:spec-coverage
      ▼
gate               every non-governance rule is referenced; rules.md not stale
```

Regenerate the rule lists after a spec change:

```bash
yarn generate:rules                    # all components
yarn generate:rules --component dialog  # just one (name or prefix)
```

`*.rules.md` is generated — **do not hand-edit**. The generator refuses to run if
its source `md_design/*.md` no longer matches the hash its extraction tables were
reviewed against (`expectedHash` in the component's config); when that fires,
re-review the config's line-number entries, then update the hash. `md_design/`
itself is owned by design and is never edited here.

## Layout

```
src/tests/
  <component>/                button · dialog · drawer · select
    <component>.rules.md       generated rules (do not hand-edit)
    <component>.appearance.spec.ts   color / type / shape / elevation
    <component>.a11y.spec.ts          roles, aria, focus, keyboard
    <component>.behavior.spec.ts      open / close / interaction
    <component>.geometry.spec.ts      sizes (button only)
    <component>.todo.spec.ts          it.todo for unreachable rules
    FINDINGS.md                       code ↔ spec divergences
  helpers/
    mount.ts / select.ts       mount a host component for a test
    modal.ts                   open dialogs / drawers via the modal service
    fixture.ts                 createTrackedHost() — create + auto-teardown
    dom.ts                     must() — querySelector that throws on null
    styles.ts / tokens.ts      hex→rgb, theme-ready wait, etc.
  tools/
    generate-rule-spec.ts      CLI behind `yarn generate:rules`
    check-spec-coverage.ts     CLI behind `yarn check:spec-coverage`
    rule-spec/                 core parser + per-component config + registry
  setup.ts                     disables motion, waits for the theme stylesheet
  test-providers.ts            DI providers for the harness
```

## Adding a rule test

1. Find the rule id in `<component>/<component>.rules.md`.
2. Add an `it('<RULE-ID> — …')` in the matching `*.spec.ts`, or an
   `it.todo('<RULE-ID> — …')` if it can't be measured yet.
3. Run `yarn check:spec-coverage` (every rule must be referenced) and
   `yarn test:conformance`.
