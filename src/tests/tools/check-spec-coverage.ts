import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import fg from 'fast-glob';
import {buildRuleSpec} from './rule-spec/core';
import {COMPONENTS} from './rule-spec/registry';

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

// Pure [DS] rules must have NO test/todo; everything else must have at least
// one. readRules tracks which list each ID came from (governance vs not) by
// watching for the '## Design-system governance' heading buildRuleSpec emits.
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

// Scanned ONCE across all spec files; refs are bucketed by their 3-letter
// prefix so each component is checked only against its own tests.
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

const refs = readTests();
const byPrefix = new Map<string, TestRef[]>();

for (const ref of refs) {
  const prefix = ref.id.slice(0, 3);

  byPrefix.set(prefix, [...(byPrefix.get(prefix) ?? []), ref]);
}

const registeredPrefixes = new Set(COMPONENTS.map((c) => c.prefix));
const errors: string[] = [];

// Orphan guard: any ref whose prefix maps to no registered component would
// otherwise fall into no per-component bucket and silently pass.
for (const [prefix, list] of byPrefix) {
  if (!registeredPrefixes.has(prefix)) {
    for (const ref of list) {
      errors.push(`ERROR ${ref.id} in ${ref.file} has unregistered component prefix "${prefix}"`);
    }
  }
}

for (const config of COMPONENTS) {
  const committed = readFileSync(resolve(process.cwd(), config.rulesFile), 'utf8');
  let fresh: string;

  try {
    fresh = buildRuleSpec(config, readFileSync(resolve(process.cwd(), '..', config.sourceFile), 'utf8'));
  } catch (error) {
    errors.push(`ERROR [${config.displayName}] ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }

  if (committed !== fresh) {
    errors.push(
      `ERROR [${config.displayName}] ${config.rulesFile} is stale — run `
      + `\`yarn generate:rules --component ${config.displayName.toLowerCase()}\` and commit the result.`,
    );
    continue;
  }

  const rules = readRules(committed);
  const compRefs = byPrefix.get(config.prefix) ?? [];
  const refIds = new Set(compRefs.map((r) => r.id));
  const ruleIds = new Set(rules.map((r) => r.id));

  for (const rule of rules.filter((r) => !r.governance && !refIds.has(r.id))) {
    errors.push(`ERROR [${config.displayName}] ${rule.id} has no test or todo`);
  }

  for (const rule of rules.filter((r) => r.governance && refIds.has(r.id))) {
    errors.push(`ERROR [${config.displayName}] ${rule.id} is pure [DS] governance but has a test/todo reference — governance rules should have none`);
  }

  for (const ref of compRefs.filter((r) => !ruleIds.has(r.id))) {
    errors.push(`ERROR [${config.displayName}] ${ref.id} referenced in ${ref.file} but absent from ${config.rulesFile}`);
  }

  const governanceCount = rules.filter((r) => r.governance).length;

  console.log(`[${config.displayName}] ${rules.length} rules (${governanceCount} governance), ${compRefs.length} test references`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }

  console.error(`\n${errors.length} coverage problem(s)`);
  process.exit(1);
}

console.log('\nall spec rules are referenced');
