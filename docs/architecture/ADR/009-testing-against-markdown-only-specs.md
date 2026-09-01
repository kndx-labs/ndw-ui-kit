# 009 Testing components against markdown-only design specs

- Status: Accepted
- Date: 2026-09-01

## Context and Problem Statement

The only design artifact we get per component is free-form markdown
(`md_design/*.md`, one file per component) — prose and bullet lists,
not a formal or machine-checkable spec. That creates three problems:

- The spec mixes facts a single component test can assert (a token
  value, a computed style) with design-system governance a component
  test structurally cannot verify (e.g. "one primary button per
  screen"), and with bullets that are ambiguous or omit a value needed
  to assert anything.
- What the spec does describe — colors, spacing, box-shadow spread,
  focus rings — are real computed CSS/layout values. `jsdom`'s CSS
  engine doesn't compute layout or fully resolve shadows/borders, so it
  can't be trusted to check them.
- The spec files must never be edited — no inline IDs, no markup. They
  are shared design artifacts outside this repo's ownership. But tests
  and `it.todo()` placeholders still need something stable to reference
  per bullet, and a way to prove every bullet is accounted for.

## Considered Options

**Test strategy:**

1. **Manual/visual QA against the spec, no automated suite.** Rejected
   — no regression safety, doesn't scale past the first review.
2. **Force every bullet into a pass/fail assertion.** Rejected — a
   meaningful fraction of bullets are governance, not component
   behavior, or the spec omits the value an assertion would need.
   Forcing a test here means asserting something meaningless, or
   silently rewriting the spec's intent to make it pass.
3. **A conformance-audit suite, run in a real browser, scoped to what a
   bullet can actually assert — with every gap tracked, not dropped.**
   Chosen.

**Tracking bullets without editing the spec**, needed to implement
option 3:

1. **Hand-tag IDs directly in the spec file.** Rejected — mutates a
   file we don't own, for every component.
2. **An LLM-followed procedure ("skill") that reads the spec and judges
   classification each run**, instead of a script. More adaptable to
   spec changes and new components, but staleness becomes
   unverifiable: no deterministic output to diff or hash-check the
   regeneration against, so a careless run could silently misclassify
   a bullet with nothing to catch it.
3. **A mechanical parser per component, guarded by a hash of its source
   spec.** Chosen.

## Decision Outcome

- **Real rendering.** `@vitest/browser` + Playwright (Chromium), via
  Angular's unit-test builder — not `jsdom` — so assertions read actual
  `getComputedStyle`/layout output.

- **Scope.** Only spec bullets tagged `[CODE]`/`[DS + CODE]` get a test
  or `it.todo()` at all. Pure `[DS]` bullets are governance and get no
  test-suite presence.

- **Mindset.** A failing test is a finding — code diverges from the
  written spec — not a bug in the test. Findings are written to a
  `FINDINGS.md` per component for a human to resolve (fix the code, or
  fix the spec).

- **No silent gaps.** A bullet that's untagged, missing a needed value,
  ambiguous (two acceptable outcomes), or beyond this harness's reach
  (e.g. holding `:active` across a synthetic pointer event) gets an
  `it.todo()` stating why, not a deletion.

- **Rule extraction, per component.** A generator script
  (`generate-rule-spec.ts` for button) reads `{component}.md` and
  writes `src/tests/{component}/{component}.rules.md` — committed,
  human-readable, never hand-edited. It walks the document once,
  assigns `{PREFIX}-{SECTION}-{NN}` IDs in order, and classifies each
  bullet using tables (`SPLITS`, `REDIRECTS`, `HEADING_SECTION`) keyed
  to that component's current spec text. A `sha256` of the spec is
  hardcoded into the script; if the spec no longer matches, the script
  throws instead of silently misclassifying a bullet whose line moved.
  This complements the separate staleness check below (which regenerates
  the rules file and diffs it): the diff catches a hand-edited rules
  file, while the hash catches *any* source change — even a reworded
  bullet whose truncated summary comes out byte-identical, which the
  diff alone would miss. There's no shared generic parser across
  components — the
  classification tables are inherently specific to one document's
  phrasing, so sharing them would mean fighting false generality more
  than it would save code.

- **Coverage enforcement.** `check:spec-coverage` fails the build if
  any in-scope rule ID has no test/todo, any governance ID has one it
  shouldn't, or a component's rules file is stale relative to its
  spec. Today this script only knows about button; wiring in a second
  component means extending it to loop over each component's (spec,
  generator, rules file) triple, not copying the whole script.

This is the pattern for every component with a `md_design/*.md` spec,
not just the one it was proven on first.

## Consequences

### Pros

- Failures are actionable: they point at a specific spec/code
  disagreement, not "some tests are red."
- Nothing is silently skipped — every bullet lands in a test, a todo
  with a reason, or the governance list.
- Real browser measurement catches rendering facts `jsdom` would miss
  or misreport.
- Every spec file is provably untouched — each generator only reads
  its file.
- A spec edit fails loudly (hash mismatch) instead of silently
  producing wrong IDs, for any component.

### Cons

- Heavier/slower than `jsdom` — a real Chromium instance per run.
- The suite can't fully self-certify: whether a bullet is genuinely
  untestable-as-written vs. just under-specified is a judgment call,
  made once (by the generator's tables) and not re-checked. A wrong
  call passes quietly. The hash check only proves *someone* re-reviewed
  the tables after a spec change — not that the review was correct.
- Depends on specs following the `[CODE]`/`[DS]`/`[DS + CODE]` tagging
  convention. A spec written without it needs that classification done
  by hand before this pattern applies to it.
- Per-component tables mean per-component work: adding `dialog.md`
  means writing a new generator script and its own `SPLITS`/
  `REDIRECTS`/`HEADING_SECTION` tables, not flipping a config flag.
- `generate-rule-spec.ts` and `check-spec-coverage.ts` are currently
  named/structured as if button were the only component (no component
  name in the filename, no loop over multiple specs). Both need
  generalizing before a second component's tests land.
