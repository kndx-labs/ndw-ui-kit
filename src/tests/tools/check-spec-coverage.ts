import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import fg from 'fast-glob';

interface SpecRule {
  id: string;
  tag: string;
  line: number;
}

interface TestRef {
  id: string;
  kind: 'test' | 'todo';
  file: string;
}

// Two tag shapes appear in the spec: bold body bullets ("**[DS]** text") and
// plain heading tags ("### Heading — [DS]"). Both must resolve to the same
// tag label, so each alternative gets its own capture group and the code
// below picks whichever one fired.
const TAG_VALUE = String.raw`CODE|DS \+ CODE|DS`;
const TAG_BOLD = String.raw`\*\*\[(${TAG_VALUE})\][^*]*\*\*`;
// Excludes any '[DS]'-shaped substring adjacent to an asterisk, so this never
// re-matches a bracket that TAG_BOLD already consumed as part of "**[DS]**".
const TAG_PLAIN = String.raw`(?<!\*)\[(${TAG_VALUE})\](?!\*)`;
const TAG = `(?:${TAG_BOLD}|${TAG_PLAIN})`;
const ID = String.raw`([A-Z]{3}-[A-Z]{3}-\d{2})`;
const RULE_RE = new RegExp(`${TAG}\\s*\\(${ID}\\)`, 'g');
const BARE_TAG_RE = new RegExp(`${TAG}(?!\\s*\\()`, 'g');
// it.each<GenericArgs>([...]) is common in these specs (e.g. it.each<Size>([...])) —
// the optional <...> must be skipped, or the whole it.each() call is invisible here.
const TEST_RE = /\b(it\.todo|it\.each(?:<[^>]*>)?\([\s\S]*?\)|it|describe)\s*\(\s*[`'"]([^`'"]+)/g;
const ID_IN_TITLE_RE = /[A-Z]{3}-[A-Z]{3}-\d{2}/g;

const specPath = process.argv[2] ?? '../md_design/button.md';
const testsRoot = resolve(process.cwd(), 'src/tests');

const readSpec = (path: string): {rules: SpecRule[]; untagged: number[]} => {
  const text = readFileSync(resolve(process.cwd(), path), 'utf8');
  const lines = text.split('\n');
  const legendStart = lines.findIndex((l) => l.startsWith('### Legend'));
  const legendEnd = lines.findIndex((l, i) => i > legendStart && l.startsWith('## '));
  // The YAML frontmatter's `description` field explains the tag vocabulary in
  // prose (e.g. "Rules are tagged [CODE] / [DS] / [DS + CODE]") — the same
  // kind of vocabulary mention as the Legend, not a rule.
  const frontmatterStart = lines.findIndex((l) => l.trim() === '---');
  const frontmatterEnd = lines.findIndex((l, i) => i > frontmatterStart && l.trim() === '---');

  const rules: SpecRule[] = [];
  const untagged: number[] = [];

  lines.forEach((line, index) => {
    const inLegend = legendStart >= 0 && index >= legendStart && index < legendEnd;
    const inFrontmatter = frontmatterStart >= 0 && index >= frontmatterStart && index <= frontmatterEnd;

    if (inFrontmatter) {
      return;
    }

    for (const match of line.matchAll(RULE_RE)) {
      rules.push({id: match[3] ?? '', tag: match[1] ?? match[2] ?? '', line: index + 1});
    }

    if (!inLegend) {
      for (const _ of line.matchAll(BARE_TAG_RE)) {
        untagged.push(index + 1);
      }
    }
  });

  return {rules, untagged};
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

const {rules, untagged} = readSpec(specPath);
const refs = readTests();
const refIds = new Set(refs.map((r) => r.id));
const ruleIds = new Set(rules.map((r) => r.id));

const uncovered = rules.filter((r) => !refIds.has(r.id));
const stale = refs.filter((r) => !ruleIds.has(r.id));

console.log(`spec rules: ${rules.length}   test references: ${refs.length}`);

for (const rule of rules) {
  const kinds = [...new Set(refs.filter((r) => r.id === rule.id).map((r) => r.kind))];
  const where = kinds.length > 0 ? kinds.sort().join('+') : 'MISSING';

  console.log(`  ${rule.id}  ${rule.tag.padEnd(9)}  ${where}`);
}

for (const rule of uncovered) {
  console.error(`ERROR ${rule.id} (spec line ${rule.line}) has no test or todo`);
}

for (const ref of stale) {
  console.error(`ERROR ${ref.id} referenced in ${ref.file} but absent from the spec`);
}

// Informational, not fatal: a bare tag mention inside a sentence that already
// carries its own tag+ID (e.g. a secondary "[DS]" clarifying which guidance a
// rule refers to) is expected editorial style, not a rule that lost its ID.
// The invariant this script enforces is narrower: every *rule ID* has
// coverage, and no test references an ID the spec doesn't have.
for (const line of untagged) {
  console.warn(`NOTE spec line ${line} has a tag with no rule ID (informational)`);
}

const failures = uncovered.length + stale.length;

if (failures > 0) {
  console.error(`\n${failures} coverage problem(s)`);
  process.exit(1);
}

console.log('\nall spec rules are referenced');
