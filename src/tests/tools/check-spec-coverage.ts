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
