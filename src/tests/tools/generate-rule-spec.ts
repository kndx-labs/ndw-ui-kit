import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {buildRuleSpec} from './rule-spec/core';
import {COMPONENTS, getComponent} from './rule-spec/registry';

// CLI: `tsx generate-rule-spec.ts` regenerates every registered component;
// `--component <name|prefix>` regenerates just one. Run from ndw-ui-kit/;
// sourceFile is repo-root-relative, so resolve against the parent of cwd.
const argIndex = process.argv.indexOf('--component');
const targets = argIndex >= 0 ? [getComponent(process.argv[argIndex + 1] ?? '')] : COMPONENTS;

for (const config of targets) {
  const source = readFileSync(resolve(process.cwd(), '..', config.sourceFile), 'utf8');

  try {
    writeFileSync(resolve(process.cwd(), config.rulesFile), buildRuleSpec(config, source), 'utf8');
    console.log(`wrote ${config.rulesFile}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
