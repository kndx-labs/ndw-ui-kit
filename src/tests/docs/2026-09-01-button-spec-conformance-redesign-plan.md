# Button Spec-Conformance Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the existing `test/button-spec-conformance` branch so that rule
IDs live in a generated file (`button.rules.md`), never in `md_design/button.md`
itself, and so the test suite covers only `[CODE]`/`[DS + CODE]` rules.

**Architecture:** A new generator (`generate-rule-spec.ts`) parses the
unmodified `md_design/button.md`, assigns IDs mechanically (with a small,
explicit table of overrides for the document's known irregular bullets), and
emits `src/tests/button/button.rules.md` — a committed, human-readable,
regenerable artifact. `check-spec-coverage.ts` is repointed at that generated
file instead of the source, and gains a staleness check. The existing test
files are rescoped: one previously-tested rule is dropped (its source bullet
has no tag, and this branch no longer invents one), and `button.todo.spec.ts`
drops its entire `[DS]`-governance block in favor of listing those rules only
in `button.rules.md`.

**Tech Stack:** TypeScript, `tsx` (already used by every script under
`ndw-ui-kit/scripts/` and the existing `check-spec-coverage.ts`), Node's
`node:fs`/`node:path`. No new dependencies.

**Spec:** `ndw-ui-kit/src/tests/docs/2026-09-01-button-spec-conformance-redesign.md`
(and, for context on what it supersedes,
`ndw-ui-kit/src/tests/docs/2026-08-31-button-spec-conformance-design.md`)

## Global Constraints

- **`md_design/button.md` is never modified — not by hand, not by a script.** Every task in this plan reads it; none writes it. If a task step ever needs to change what a test asserts, the fix goes in the generated file's override tables or in a `*.spec.ts` file, never in `button.md`.
- **All authored files stay under `ndw-ui-kit/src/tests/`.** The only files this plan touches outside it are none — even `package.json` already has the scripts this plan needs from the original pilot.
- **A failing conformance test is a finding, not a bug to fix.** Never edit `src/lib/**` to make a test pass. `BTN-DOD-04` and `BTN-ELV-02` are expected to keep failing throughout this plan; if a step's test run shows a different failure count than expected, investigate before continuing — don't silently accept a new failure or a newly-passing test as "probably fine."
- **Working directory for every command in this plan:** `ndw-ui-kit/`.
- **Rule ID format is unchanged:** `BTN-{SECTION}-{NN}`, section codes `CLR TYP LAY ELV SHP VAR CMP STA ACC DOD`, assigned once in document order per section, permanent.
- **This plan continues the existing branch `test/button-spec-conformance`** (already checked out) — it does not create a new branch.

---

### Task 1: The generator (`generate-rule-spec.ts`) and its output (`button.rules.md`)

**Files:**
- Create: `src/tests/tools/generate-rule-spec.ts`
- Create (by running the script): `src/tests/button/button.rules.md`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `export const generateRuleSpec = (sourceText: string): string => ...` — pure function, source markdown in, generated markdown out. Task 2 imports it directly.

- [ ] **Step 1: Write the generator**

Create `src/tests/tools/generate-rule-spec.ts`:

```ts
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

interface Block {
  line: number;        // 1-indexed source line where this block starts
  kind: 'bullet' | 'heading' | 'paragraph';
  text: string;         // full block text, joined
  tag: 'CODE' | 'DS' | 'DS + CODE' | null;
  section: string;      // section code at this point in the document; '' if none yet
}

interface RuleEntry {
  id: string;
  tag: 'CODE' | 'DS' | 'DS + CODE';
  line: number;
  summary: string;
}

const SECTION_ORDER = ['CLR', 'TYP', 'LAY', 'ELV', 'SHP', 'VAR', 'CMP', 'STA', 'ACC', 'DOD'];

const SECTION_NAMES: Record<string, string> = {
  CLR: 'Colors',
  TYP: 'Typography',
  LAY: 'Layout',
  ELV: 'Elevation & Depth',
  SHP: 'Shapes',
  VAR: 'Variants',
  CMP: 'Composition',
  STA: 'States',
  ACC: 'Accessibility',
  DOD: 'Do\'s and Don\'ts',
};

// Heading text (with any "— ..." suffix already stripped) is matched against
// these prefixes, longest/most-specific checked first isn't needed since none
// of these prefixes overlap.
const HEADING_SECTION: Array<{prefix: string; code: string}> = [
  {prefix: 'Colors', code: 'CLR'},
  {prefix: 'Typography', code: 'TYP'},
  {prefix: 'Layout', code: 'LAY'},
  {prefix: 'Size guide', code: 'LAY'},
  {prefix: 'Elevation & Depth', code: 'ELV'},
  {prefix: 'Shapes', code: 'SHP'},
  {prefix: 'Variants (type)', code: 'VAR'},
  {prefix: 'Negative / critical status usage', code: 'VAR'},
  {prefix: 'Composition', code: 'CMP'},
  {prefix: 'States', code: 'STA'},
  {prefix: 'Accessibility', code: 'ACC'},
  {prefix: 'Do\'s and Don\'ts', code: 'DOD'},
];

const TAG_VALUE = String.raw`CODE|DS \+ CODE|DS`;
const TAG_RE = new RegExp(`\\[(${TAG_VALUE})\\]`);

// Two source bullets each state one testable claim and one that isn't; the
// generator emits the bullet's normal, mechanically-assigned ID as a real
// per-section rule, then injects one extra ID (from this table) for the
// bullet's second, non-testable claim. See redesign doc §6.6.
const SPLITS: Array<{line: number; extraId: string; destination: 'untestable' | 'ambiguous'; summary: string}> = [
  {
    line: 129,
    extraId: 'BTN-LAY-05',
    destination: 'untestable',
    summary: 'per-size padding: no values stated (code has 6/8, 8/12, 4/16, 8/20)',
  },
  {
    line: 153,
    extraId: 'BTN-SHP-03',
    destination: 'ambiguous',
    summary: 'ghost/tertiary border "transparent OR token-driven": two acceptable outcomes',
  },
];

// Two source bullets are wholly untestable/ambiguous, not just in part — the
// bullet's own mechanically-assigned ID is redirected to a special list
// instead of the normal per-section list. See redesign doc §6.4.
const REDIRECTS: Array<{line: number; destination: 'untestable' | 'ambiguous'; summary: string; duplicateOf?: string}> = [
  {
    line: 134,
    destination: 'untestable',
    summary: 'hover drop-shadow: "subtle", no token or value given',
  },
  {
    line: 251,
    destination: 'ambiguous',
    // "duplicates **BTN-ACC-01**" is rendered separately by the output loop
    // below (via `duplicateOf`) — this summary only needs the remainder.
    summary: 'the accessible-name rule stated twice',
    duplicateOf: 'BTN-ACC-01',
  },
];

// The only prose paragraph (not a heading, not a bulleted list item) whose
// first sentence carries its own classifying tag. See redesign doc §6.
const VARIANTS_INTRO_LINE = 160;

const cleanHeadingText = (raw: string): string => {
  return raw.replace(/^#{2,3}\s+/, '').split(' — ')[0] ?? '';
};

const sectionForHeading = (raw: string): string => {
  const cleaned = cleanHeadingText(raw);
  const match = HEADING_SECTION.find((h) => cleaned.startsWith(h.prefix));

  return match?.code ?? '';
};

// True if the first non-blank line at or after `fromIndex` (0-indexed into
// `lines`) is a top-level bullet, as opposed to prose or a table. Used only
// to decide whether a heading's own tag is redundant with a bullet that
// immediately follows it (§6.5) — deliberately reads raw source lines, not
// the abstracted block list, because prose and tables between a heading and
// a later bullet are never turned into blocks at all.
const firstNonBlankIsBullet = (lines: string[], fromIndex: number): boolean => {
  for (let k = fromIndex; k < lines.length; k += 1) {
    const text = (lines[k] ?? '').trim();

    if (text === '') {
      continue;
    }

    return /^-\s/.test(lines[k] ?? '');
  }

  return false;
};

const parseBlocks = (lines: string[]): Block[] => {
  const blocks: Block[] = [];
  let currentSection = '';
  let legendActive = false;
  // True from the moment a heading is given its own rule ID (because it has
  // no tagged bullet directly after it) until the next heading. Bullets in
  // that span with no tag of their own are supporting content for the
  // heading's rule (e.g. the "account deletion" / "custom-settings deletion"
  // list under "### Negative / critical status usage") — not separate rules,
  // and not missing-tag defects either. Bullets in that span that DO carry
  // their own tag are unaffected and still get their own ID as normal.
  let headingOwnsContent = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    const lineNo = i + 1;

    if (/^###?\s/.test(line)) {
      legendActive = line.startsWith('### Legend');

      const section = sectionForHeading(line);

      if (section) {
        currentSection = section;
      }

      if (legendActive) {
        headingOwnsContent = false;
        continue;
      }

      const tagMatch = TAG_RE.exec(line);
      const tag = (tagMatch?.[1] as Block['tag']) ?? null;
      const followedByBullet = firstNonBlankIsBullet(lines, i + 1);

      if (tag && !followedByBullet) {
        blocks.push({line: lineNo, kind: 'heading', text: line, tag, section: currentSection});
        headingOwnsContent = true;
      } else {
        headingOwnsContent = false;
      }

      continue;
    }

    if (legendActive) {
      continue;
    }

    if (lineNo === VARIANTS_INTRO_LINE) {
      const paragraphLines = [line];
      let j = i + 1;

      while (j < lines.length && (lines[j] ?? '').trim() !== '') {
        paragraphLines.push(lines[j] ?? '');
        j += 1;
      }

      const text = paragraphLines.join(' ');
      const tagMatch = TAG_RE.exec(text);

      blocks.push({
        line: lineNo,
        kind: 'paragraph',
        text,
        tag: (tagMatch?.[1] as Block['tag']) ?? null,
        section: currentSection,
      });
      headingOwnsContent = false;
      i = j - 1;
      continue;
    }

    if (/^-\s/.test(line)) {
      const bulletLines = [line];
      let j = i + 1;

      while (j < lines.length && !/^###?\s/.test(lines[j] ?? '') && !/^-\s/.test(lines[j] ?? '') && (lines[j] ?? '').trim() !== '') {
        bulletLines.push(lines[j] ?? '');
        j += 1;
      }

      const text = bulletLines.join(' ');
      // First tag anywhere in the bullet's full text is its classifying tag.
      // This correctly handles every shape in the document without a
      // separate "leading tag" pattern: a plain "- **[CODE]** ..." bullet, a
      // "- **[CODE] caveat** ..." qualifier (the bold span wraps "[CODE]
      // caveat" together, so the tag isn't immediately followed by a closing
      // "**", but it's still the first bracket in the text), a
      // "- **Label** — **[TAG]**" bullet (Variants section), and the one
      // bullet with no leading tag at all (line 255, where "first tag
      // anywhere" correctly picks [DS] over the later inline [CODE] mention
      // per §6.7).
      const tag = (TAG_RE.exec(text)?.[1] as Block['tag']) ?? null;

      if (!tag && headingOwnsContent) {
        i = j - 1;
        continue;
      }

      blocks.push({line: lineNo, kind: 'bullet', text, tag, section: currentSection});
      i = j - 1;
    }
  }

  return blocks;
};

const summarize = (text: string): string => {
  const cleaned = text
    .replace(/^#{2,3}\s+/, '')
    .replace(/\*\*\[[^\]]+\][^*]*\*\*/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/^-\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*—\s*$/, '')
    .trim();

  return cleaned.length > 100 ? `${cleaned.slice(0, 97)}...` : cleaned;
};

export const generateRuleSpec = (sourceText: string): string => {
  const lines = sourceText.split('\n');
  const blocks = parseBlocks(lines);

  const bySection = new Map<string, RuleEntry[]>();
  const governance: RuleEntry[] = [];
  const untagged: Array<{line: number; summary: string}> = [];
  const untestable: RuleEntry[] = [];
  const ambiguous: Array<RuleEntry & {duplicateOf?: string}> = [];
  const counters = new Map<string, number>();

  const nextId = (section: string): string => {
    const n = (counters.get(section) ?? 0) + 1;

    counters.set(section, n);

    return `BTN-${section}-${String(n).padStart(2, '0')}`;
  };

  for (const block of blocks) {
    // Structural content outside any of the ten rule sections (the Overview
    // section's "- **type** — ..." axis bullets, before any section heading
    // has been seen) is never a rule, tagged or not — skip it entirely
    // before even checking for a tag, so it can't be miscounted as a
    // missing-tag defect.
    if (!block.section) {
      continue;
    }

    if (!block.tag) {
      if (block.kind === 'bullet') {
        untagged.push({line: block.line, summary: summarize(block.text)});
      }

      continue;
    }

    const id = nextId(block.section);
    const entry: RuleEntry = {id, tag: block.tag, line: block.line, summary: summarize(block.text)};

    const redirect = REDIRECTS.find((r) => r.line === block.line);

    // Pushed to each specifically-typed array directly, not through a shared
    // `target` variable — a variable typed as the union of both arrays can't
    // accept `duplicateOf` (only the ambiguous list's element type has it),
    // and tsconfig's `exactOptionalPropertyTypes` also means that field must
    // be omitted entirely rather than explicitly set to `undefined`.
    if (redirect?.destination === 'untestable') {
      untestable.push({...entry, summary: redirect.summary});
    } else if (redirect?.destination === 'ambiguous') {
      ambiguous.push({
        ...entry,
        summary: redirect.summary,
        ...(redirect.duplicateOf ? {duplicateOf: redirect.duplicateOf} : {}),
      });
    } else if (block.tag === 'DS') {
      governance.push(entry);
    } else {
      const list = bySection.get(block.section) ?? [];

      list.push(entry);
      bySection.set(block.section, list);
    }

    const split = SPLITS.find((s) => s.line === block.line);

    if (split) {
      const target = split.destination === 'untestable' ? untestable : ambiguous;

      target.push({id: split.extraId, tag: block.tag, line: block.line, summary: split.summary});
    }
  }

  const lines_out: string[] = [];

  lines_out.push('# Button — Test Rule Extraction');
  lines_out.push('');
  lines_out.push('Generated from `md_design/button.md` (version: alpha) by');
  lines_out.push('`src/tests/tools/generate-rule-spec.ts`. Do not hand-edit — rerun the');
  lines_out.push('generator instead. If a fresh run produces a diff, `button.md` changed');
  lines_out.push('and this file is stale.');
  lines_out.push('');
  lines_out.push('## Legend');
  lines_out.push('');
  lines_out.push('- **[CODE]** / **[DS + CODE]** — in scope for a real test.');
  lines_out.push('- **[DS]** — out of scope: design-system governance a single component');
  lines_out.push('  test cannot verify. Listed for traceability, not tested.');

  for (const code of SECTION_ORDER) {
    const entries = bySection.get(code) ?? [];

    lines_out.push('');
    lines_out.push(`## ${SECTION_NAMES[code]} (${code})`);
    lines_out.push('');

    if (entries.length === 0) {
      lines_out.push('_(no CODE/DS + CODE rules in this section)_');
    } else {
      for (const entry of entries) {
        lines_out.push(`- **${entry.id}** \`[${entry.tag}]\` (button.md:${entry.line}) — ${entry.summary}`);
      }
    }
  }

  lines_out.push('');
  lines_out.push('## Design-system governance — out of scope');
  lines_out.push('');
  lines_out.push('Pure `[DS]` rules. Listed for traceability; none of these get a test.');
  lines_out.push('');

  for (const entry of governance) {
    lines_out.push(`- **${entry.id}** \`[DS]\` (button.md:${entry.line}) — ${entry.summary}`);
  }

  lines_out.push('');
  lines_out.push('## Untagged bullets — spec defect');
  lines_out.push('');
  lines_out.push('Bullets with no `[CODE]`/`[DS]`/`[DS + CODE]` tag in the source. Not');
  lines_out.push('classified, not tested.');
  lines_out.push('');

  for (const u of untagged) {
    lines_out.push(`- (button.md:${u.line}) "${u.summary}" — no tag in the source.`);
  }

  lines_out.push('');
  lines_out.push('## Untestable as written — spec defect');
  lines_out.push('');
  lines_out.push('Tagged rules that can\'t produce a single clean assertion because the');
  lines_out.push('spec omits a value.');
  lines_out.push('');

  for (const entry of untestable) {
    lines_out.push(`- **${entry.id}** \`[${entry.tag}]\` (button.md:${entry.line}) — ${entry.summary}`);
  }

  lines_out.push('');
  lines_out.push('## Ambiguous or duplicate bullets');
  lines_out.push('');
  lines_out.push('Tagged rules that can\'t produce a single clean assertion because they');
  lines_out.push('state two acceptable outcomes, or restate another rule.');
  lines_out.push('');

  for (const entry of ambiguous) {
    const dup = entry.duplicateOf ? ` duplicates **${entry.duplicateOf}**` : '';

    lines_out.push(`- **${entry.id}** \`[${entry.tag}]\` (button.md:${entry.line})${dup} — ${entry.summary}`);
  }

  lines_out.push('');

  return lines_out.join('\n');
};

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);

if (isMain) {
  const sourcePath = resolve(process.cwd(), '../md_design/button.md');
  const outputPath = resolve(process.cwd(), 'src/tests/button/button.rules.md');
  const source = readFileSync(sourcePath, 'utf8');
  const generated = generateRuleSpec(source);

  writeFileSync(outputPath, generated, 'utf8');
  console.log(`wrote ${outputPath}`);
}
```

- [ ] **Step 2: Add the npm script**

In `package.json` `scripts`, alongside `"check:spec-coverage"`:

```json
"generate:button-rules": "tsx src/tests/tools/generate-rule-spec.ts",
```

- [ ] **Step 3: Run the generator**

```bash
yarn generate:button-rules
```

Expected: `wrote .../src/tests/button/button.rules.md`, no errors.

- [ ] **Step 4: Inspect the output against the redesign doc's expected counts**

```bash
grep -c '^\- \*\*BTN-' src/tests/button/button.rules.md
```

Expected: `41` (matches redesign doc §8's "41 total addressable IDs").

```bash
grep -A20 'Design-system governance' src/tests/button/button.rules.md | grep -c '^\- \*\*BTN-'
```

Expected: `14`.

```bash
grep -A10 'Untagged bullets' src/tests/button/button.rules.md | grep -c 'button.md:'
```

Expected: `1` (the resting-elevation bullet, line 140).

```bash
grep -A10 'Untestable as written' src/tests/button/button.rules.md | grep -c '^\- \*\*BTN-'
```

Expected: `2` (`BTN-LAY-05`, `BTN-ELV-01`).

```bash
grep -A10 'Ambiguous or duplicate' src/tests/button/button.rules.md | grep -c '^\- \*\*BTN-'
```

Expected: `2` (`BTN-SHP-03`, `BTN-DOD-03`).

- [ ] **Step 5: Verify the exact IDs, not just the counts**

```bash
grep -oE 'BTN-[A-Z]{3}-[0-9]{2}' src/tests/button/button.rules.md | sort -u > /tmp/generated-ids.txt
wc -l /tmp/generated-ids.txt
```

Expected: `41`.

```bash
cat src/tests/button/button.rules.md
```

Read the full output. Confirm by eye:
- `BTN-LAY-01` and `BTN-VAR-09` each appear exactly once, as their own entries (the heading-tag cases with no bullet directly after).
- Neither `BTN-CMP-` nor `BTN-STA-` has an entry sourced from a heading — only from `CMP-01`/`CMP-02` and `STA-01`/`STA-02`/`STA-03` bullets.
- `BTN-LAY-04` and `BTN-LAY-05` both cite `button.md:129`.
- `BTN-SHP-02` and `BTN-SHP-03` both cite `button.md:153`.
- `BTN-VAR-01` cites `button.md:160` (the intro paragraph, not a bullet or heading).
- `BTN-DOD-03` cites `button.md:251` and shows `duplicates **BTN-ACC-01**`.
- `BTN-DOD-05` appears under governance, citing `button.md:255`.

If any of these don't match, the generator has a bug — fix it before continuing. Do not hand-edit `button.rules.md` to paper over a generator bug; the whole point of this task is that the file is trustworthy because it's generated, not edited.

- [ ] **Step 6: Commit**

```bash
git add package.json src/tests/tools/generate-rule-spec.ts src/tests/button/button.rules.md
git commit -m "feat: generate button.rules.md from md_design/button.md"
```

---

### Task 2: Repoint the coverage script at `button.rules.md`

**Files:**
- Modify: `src/tests/tools/check-spec-coverage.ts`

**Interfaces:**
- Consumes: `generateRuleSpec` from `./generate-rule-spec` (Task 1).
- Produces: `yarn check:spec-coverage` exits 0 when every non-governance ID in `button.rules.md` has a test/todo, every governance (pure `[DS]`) ID has *none*, no test references an ID absent from `button.rules.md`, and `button.rules.md` is not stale relative to `button.md`.

- [ ] **Step 1: Replace the file's spec-parsing logic**

The old script parsed `[TAG] (ID)` patterns directly out of `button.md`, and
treated every ID the same way: it must have a test or a todo. That rule no
longer holds — pure `[DS]` (governance) IDs must have *neither* under this
redesign. Replace the parsing entirely — `button.rules.md`'s format is simple
and fully controlled (`- **BTN-XXX-NN** ...`), so the parsing regex collapses
to one line — and split the coverage rule in two: non-governance IDs must be
covered, governance IDs must not be. A staleness check is also added.
Overwrite `src/tests/tools/check-spec-coverage.ts`:

```ts
import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import fg from 'fast-glob';
import {generateRuleSpec} from './generate-rule-spec';

interface Rule {
  id: string;
  governance: boolean;
}

interface TestRef {
  id: string;
  kind: 'test' | 'todo';
  file: string;
}

const ID_RE = /^\-\s+\*\*([A-Z]{3}-[A-Z]{3}-\d{2})\*\*/;
const TEST_RE = /\b(it\.todo|it\.each(?:<[^>]*>)?\([\s\S]*?\)|it|describe)\s*\(\s*[`'"]([^`'"]+)/g;
const ID_IN_TITLE_RE = /[A-Z]{3}-[A-Z]{3}-\d{2}/g;

const testsRoot = resolve(process.cwd(), 'src/tests');
const sourcePath = resolve(process.cwd(), '../md_design/button.md');
const rulesPath = resolve(process.cwd(), 'src/tests/button/button.rules.md');

// Pure [DS] rules must have NO test or todo — that's the whole point of the
// redesign's governance list. Everything else must have at least one. Which
// list an ID came from in button.rules.md is tracked here so the two rules
// can be enforced separately instead of one blanket "must have a test".
const readRules = (text: string): Rule[] => {
  const rules: Rule[] = [];
  let inGovernance = false;

  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      inGovernance = line.startsWith('## Design-system governance');
      continue;
    }

    const match = ID_RE.exec(line);

    if (match?.[1]) {
      rules.push({id: match[1], governance: inGovernance});
    }
  }

  return rules;
};

const readTests = (): TestRef[] => {
  const files = fg.sync('**/*.spec.ts', {cwd: testsRoot});
  const refs: TestRef[] = [];

  for (const file of files) {
    const text = readFileSync(join(testsRoot, file), 'utf8');

    for (const match of text.matchAll(TEST_RE)) {
      const kind = match[1] === 'it.todo' ? 'todo' : 'test';

      for (const id of (match[2] ?? '').match(ID_IN_TITLE_RE) ?? []) {
        refs.push({id, kind, file});
      }
    }
  }

  return refs;
};

const committedRulesText = readFileSync(rulesPath, 'utf8');
const freshRulesText = generateRuleSpec(readFileSync(sourcePath, 'utf8'));

if (committedRulesText !== freshRulesText) {
  console.error(
    'ERROR button.rules.md is stale — it does not match a fresh run of the '
    + 'generator. Run `yarn generate:button-rules` and commit the result.',
  );
  process.exit(1);
}

const rules = readRules(committedRulesText);
const refs = readTests();
const refIds = new Set(refs.map((r) => r.id));
const ruleIdSet = new Set(rules.map((r) => r.id));

const uncovered = rules.filter((r) => !r.governance && !refIds.has(r.id));
const wronglyTested = rules.filter((r) => r.governance && refIds.has(r.id));
const stale = refs.filter((r) => !ruleIdSet.has(r.id));
const governanceCount = rules.filter((r) => r.governance).length;

console.log(`spec rules: ${rules.length} (${governanceCount} governance)   test references: ${refs.length}`);

for (const rule of rules) {
  const kinds = [...new Set(refs.filter((r) => r.id === rule.id).map((r) => r.kind))];
  const where = rule.governance
    ? (kinds.length > 0 ? `UNEXPECTED:${kinds.sort().join('+')}` : 'governance')
    : (kinds.length > 0 ? kinds.sort().join('+') : 'MISSING');

  console.log(`  ${rule.id}  ${where}`);
}

for (const rule of uncovered) {
  console.error(`ERROR ${rule.id} has no test or todo`);
}

for (const rule of wronglyTested) {
  console.error(`ERROR ${rule.id} is pure [DS] governance but has a test/todo reference — governance rules should have none`);
}

for (const ref of stale) {
  console.error(`ERROR ${ref.id} referenced in ${ref.file} but absent from button.rules.md`);
}

const failures = uncovered.length + wronglyTested.length + stale.length;

if (failures > 0) {
  console.error(`\n${failures} coverage problem(s)`);
  process.exit(1);
}

console.log('\nall spec rules are referenced');
```

- [ ] **Step 2: Run it — expect failures, since the test files haven't been rescoped yet**

```bash
yarn check:spec-coverage
```

Expected: **exit 1, 15 coverage problems** — this is correct and expected at
this point, not a bug: the old `button.todo.spec.ts` still has its 13 `[DS]`
entries (`BTN-CLR-03`, `BTN-LAY-01`, `BTN-VAR-02..09`, `BTN-ACC-02`,
`BTN-DOD-01`, `BTN-DOD-02`) plus `BTN-DOD-05`, and under the new governance
rule a pure-`[DS]` ID must have **no** test/todo reference at all — so all 14
show `ERROR ... is pure [DS] governance but has a test/todo reference`. The
old `button.appearance.spec.ts` also still has a `BTN-ELV-03` test, and that
ID no longer exists in `button.rules.md` at all (§6.2 — its source bullet has
no tag), so it shows `ERROR BTN-ELV-03 referenced in ... but absent from
button.rules.md`. 14 + 1 = 15. The important checks here are that the script
**runs without crashing**, reports **41** spec rules with **14 governance**
(not 42, confirming it reads `button.rules.md`, not `button.md`), and that
the 15 failures are *exactly* these two known, expected causes — Task 3
fixes both. If the count or the specific IDs differ from this, something
else is wrong and needs investigating before Task 3.

```bash
yarn check:spec-coverage 2>&1 | head -1
```

Expected: `spec rules: 41 (14 governance)   test references: 53`.

- [ ] **Step 3: Confirm the staleness check works**

Temporarily corrupt the committed file to prove the check catches drift:

```bash
echo "" >> src/tests/button/button.rules.md
yarn check:spec-coverage
```

Expected: exit 1, `ERROR button.rules.md is stale...`.

```bash
git checkout -- src/tests/button/button.rules.md
yarn check:spec-coverage 2>&1 | head -1
```

Expected: back to `spec rules: 41 (14 governance)   test references: 53`, no
staleness error (the same 15 governance/stale-reference problems from Step 2
are still reported below it — that's expected, unrelated to staleness, and
Task 3 still hasn't run yet).

- [ ] **Step 4: Lint**

```bash
yarn lint:ts-src
```

Expected: 0 errors (this file is already covered by the `src/tests/tools/**` eslint override from the original pilot — no new config needed).

- [ ] **Step 5: Commit**

```bash
git add src/tests/tools/check-spec-coverage.ts
git commit -m "refactor: point coverage checker at generated button.rules.md"
```

---

### Task 3: Rescope the test suite to `[CODE]`/`[DS + CODE]` only

**Files:**
- Modify: `src/tests/button/button.appearance.spec.ts`
- Modify: `src/tests/button/button.todo.spec.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks besides an updated `check:spec-coverage` result.

- [ ] **Step 1: Remove the `BTN-ELV-03` test**

`BTN-ELV-03` no longer has an ID — its source bullet (button.md:140, "Buttons
otherwise sit flat...") has no tag, and this branch no longer assigns one.
Delete its test from `src/tests/button/button.appearance.spec.ts`:

```ts
  it('BTN-ELV-03 — a resting button has no elevation', () => {
    const {styles} = mountButton();

    expect(styles().boxShadow).toBe('none');
    expect(styles().filter).toBe('none');
  });

```

(Delete the whole block, including the blank line after it. Leave everything
else in the file — `BTN-CLR-01`/`BTN-CLR-02`/`BTN-ELV-02` tests — untouched.)

- [ ] **Step 2: Rewrite the todo file**

Overwrite `src/tests/button/button.todo.spec.ts` in full:

```ts
import {describe, it} from 'vitest';

/**
 * Rules tagged [CODE] or [DS + CODE] that can't produce a real test, for one
 * of two reasons — plus one harness limitation. Pure [DS] rules are not
 * listed here at all: they're governance a component test cannot verify by
 * construction, and appear only in button.rules.md's out-of-scope list.
 */

describe('[SPEC GAP] cannot be tested as written', () => {
  it.todo('BTN-LAY-05 — per-size padding: the spec states no values (code has 6/8, 8/12, 4/16, 8/20)');
  it.todo('BTN-ELV-01 — hover drop-shadow: "subtle", no token or value given (code: drop-shadow(1px 1px 2px -1px #00000024))');
});

describe('[AMBIGUOUS/DUPLICATE] two acceptable outcomes or a restated rule', () => {
  it.todo('BTN-SHP-03 — ghost/tertiary border "transparent OR token-driven": two acceptable outcomes');
  it.todo('BTN-DOD-03 — duplicates BTN-ACC-01; one rule should not hold two IDs');
});

describe('[HARNESS LIMIT] well specified, not reachable by this tooling', () => {
  it.todo('BTN-STA-01 — pressed (:active) requires holding a pointer across the assertion');
});
```

- [ ] **Step 3: Run the conformance suite**

```bash
yarn test:conformance 2>&1 | tail -15
```

Expected: `51 passed`, `2 failed` (`BTN-DOD-04`, `BTN-ELV-02` — unchanged
findings from the original pilot), `5 todo` (58 total). This counts every
`*.spec.ts` under `src/tests`, including the 5 always-passing harness
self-tests from the original pilot's Task 2 — it is not just the button rule
tests. **If the pass count is 52, the `BTN-ELV-03` deletion in Step 1 didn't
take — check the file.**

- [ ] **Step 4: Run the coverage checker — expect it to fully pass now**

```bash
yarn check:spec-coverage
```

Expected: exit 0, `spec rules: 41 (14 governance)   test references: 38`,
ending in `all spec rules are referenced`. Each of the 27 non-governance IDs
must show `test`, `todo`, or `test+todo`; each of the 14 governance IDs must
show exactly `governance` — none `MISSING`, none `UNEXPECTED:...`.

If anything shows `MISSING`, cross-check against Task 1's expected ID list
(§Step 5 of Task 1) before assuming this task's files are wrong — a `MISSING`
row means either this task missed an ID, or Task 1's generator produced an ID
this task doesn't know about. If anything shows `UNEXPECTED:...`, a governance
rule still has a leftover test/todo reference somewhere — search for its ID
across `src/tests/button/*.spec.ts` and remove that reference.

- [ ] **Step 5: Commit**

```bash
git add src/tests/button/button.appearance.spec.ts src/tests/button/button.todo.spec.ts
git commit -m "test: rescope button suite to CODE/DS + CODE rules only"
```

---

### Task 4: Update `FINDINGS.md`

**Files:**
- Modify: `src/tests/button/FINDINGS.md`

**Interfaces:**
- Consumes: the Task 3 test-run numbers.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Update the header line**

Replace:

```markdown
Run: 2026-08-31 · 52 passed · 2 failed · 19 todo (73 total)
```

with:

```markdown
Run: 2026-09-01 · 51 passed · 2 failed · 5 todo (58 total)
```

(Use the actual numbers from Task 3 Step 3 if they differ from these
expectations — this file must describe the real run, not the plan's
prediction.)

- [ ] **Step 2: Remove `BTN-DOD-05` from the "Specification defects" table**

`BTN-DOD-05` is no longer a spec-gap finding — it's pure `[DS]` governance
under this redesign (§6.7 of the redesign doc: its primary tag is `[DS]`).
Delete its row:

```markdown
| BTN-DOD-05 | Figma defines `positive`/`warning` statuses; `BUTTON_VARIANT` doesn't expose them. The spec already flags this as an open item, so it's not a new finding — recorded here only so it appears in the same coverage sweep as the others. | No spec edit needed; this is a pending product decision, not a documentation gap. |
```

- [ ] **Step 3: Update the "Not enforceable by the component" section**

Replace:

```markdown
## Not enforceable by the component

13 `[DS]` rules — BTN-CLR-03, BTN-LAY-01, BTN-VAR-02..09, BTN-ACC-02, BTN-DOD-01, BTN-DOD-02 — listed as `it.todo` in `button.todo.spec.ts`. These are usage/governance guidance (which variant for which purpose, one primary per screen, when `negative` is warranted) that a component cannot itself know or enforce. No action; recorded so their absence of a test is never mistaken for missing coverage.
```

with:

```markdown
## Not enforceable by the component

14 `[DS]` rules — BTN-CLR-03, BTN-LAY-01, BTN-VAR-02..09, BTN-ACC-02, BTN-DOD-01, BTN-DOD-02, BTN-DOD-05 — listed in `button.rules.md`'s "Design-system governance" section, not in the test suite at all. These are usage/governance guidance (which variant for which purpose, one primary per screen, when `negative` is warranted, the open item on exposing `positive`/`warning`) that a component cannot itself know or enforce. No action; recorded so their absence of a test is never mistaken for missing coverage.
```

- [ ] **Step 4: Rewrite the "Editorial fixes" section**

This section described hand-edits to `button.md`, which no longer happen.
Replace the whole section:

```markdown
## Editorial fixes made while assigning rule IDs (Task 3–4)

Not conformance findings, but worth recording since they changed the spec text:

- Split "each size has a fixed height ... and its own padding and border radius" into a height rule (BTN-LAY-04, has values) and a padding rule (BTN-LAY-05, doesn't — see above).
- Split "all variants use a 1px border; ghost/tertiary render it transparent or token-driven" into BTN-SHP-02 (1px border, testable) and BTN-SHP-03 (the "or", not testable — see above).
- Tagged "buttons otherwise sit flat on the surface" (BTN-ELV-03) — it was the only rule in the document with no `[CODE]`/`[DS]`/`[DS + CODE]` tag at all.
- Dropped the tag from two section headings ("### Composition", "### States") that were purely restating the tag already carried by every child bullet underneath — not separate rules, and giving them placeholder IDs would have created two IDs with no distinct claim.
```

with:

```markdown
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
```

- [ ] **Step 5: Rewrite the Summary section**

Replace:

```markdown
## Summary

- 24 rules directly tested (22 with a passing test, plus BTN-STA-01 and BTN-ACC-01, each of which has a passing test *and* a `[DS]`/harness-limit sub-clause tracked separately as a todo) — 52 passing assertions in total across geometry/appearance/behaviour/a11y, including `it.each` coverage across sizes and variants.
- 2 real divergences between code and spec (1 accessibility/form-safety bug, 1 design-token discrepancy).
- 5 rules the spec can't currently be tested against, each with a concrete suggested edit.
- 13 rules correctly left to design-system governance, not the component.
- 1 rule (`pressed`) the tooling itself can't reach.
- Coverage is exhaustive: `yarn check:spec-coverage` confirms all 42 rule IDs in `md_design/button.md` are referenced by a test or a todo, and no test references an ID the spec doesn't have.
```

with:

```markdown
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
```

- [ ] **Step 6: Commit**

```bash
git add src/tests/button/FINDINGS.md
git commit -m "docs: update findings for the generated-rule-file redesign"
```

---

### Task 5: Full verification

**Files:** none created or modified — this task only runs checks.

**Interfaces:** none.

- [ ] **Step 1: Run everything**

```bash
yarn test 2>&1 | tail -10
```

Expected: `31 passed` (unaffected pre-existing jsdom suite).

```bash
yarn test:conformance 2>&1 | tail -15
```

Expected: `51 passed`, `2 failed` (`BTN-DOD-04`, `BTN-ELV-02`), `5 todo`
(58 total).

```bash
yarn check:spec-coverage
```

Expected: exit 0, ending `all spec rules are referenced`.

```bash
yarn lint:ts-src 2>&1 | tail -10
```

Expected: 0 errors (pre-existing warnings in `src/lib/core/components/modal/wait-for-animation-end.ts` are unrelated and may remain).

- [ ] **Step 2: Confirm `md_design/button.md` is still untouched**

```bash
grep -c "BTN-" /Users/taghshc/Documents/kndx-lab/md_design/button.md
wc -l /Users/taghshc/Documents/kndx-lab/md_design/button.md
```

Expected: `0` and `257` — matching the pristine original, confirmed again as
the final check of this redesign's core constraint.

- [ ] **Step 3: Review the branch's full commit list**

```bash
git log --oneline master..HEAD
```

Expected: the 9 commits from the original pilot, the redesign-doc commit,
and 5 new commits from this plan's tasks — 15 total.

- [ ] **Step 4: No commit needed for this task**

This task only verifies; nothing here is added or changed. If any check in
Step 1 or Step 2 fails, stop and fix the relevant earlier task before
declaring the branch complete — do not paper over a failing check by
adjusting this task's expectations.
