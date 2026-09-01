import {createHash} from 'node:crypto';
import {basename} from 'node:path';
import {Block, ComponentSpecConfig, RuleEntry} from './types';

const TAG_VALUE = String.raw`CODE|DS \+ CODE|DS`;
const TAG_RE = new RegExp(`\\[(${TAG_VALUE})\\]`);

const cleanHeadingText = (raw: string): string => {
  return raw.replace(/^#{2,3}\s+/, '').split(' — ')[0] ?? '';
};

const sectionForHeading = (
  raw: string,
  headingSection: ComponentSpecConfig['headingSection'],
): string => {
  const cleaned = cleanHeadingText(raw);
  const match = headingSection.find((h) => cleaned.startsWith(h.prefix));

  return match?.code ?? '';
};

// True if the first non-blank line at or after `fromIndex` (0-indexed into
// `lines`) is a top-level bullet, as opposed to prose or a table. Used only to
// decide whether a heading's own tag is redundant with a bullet that
// immediately follows it — deliberately reads raw source lines, not the
// abstracted block list, because prose and tables between a heading and a
// later bullet are never turned into blocks at all.
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

const parseBlocks = (lines: string[], config: ComponentSpecConfig): Block[] => {
  const blocks: Block[] = [];
  let currentSection = '';
  let legendActive = false;
  // True from the moment a heading is given its own rule ID (because it has no
  // tagged bullet directly after it) until the next heading. Untagged bullets
  // in that span are supporting content for the heading's rule, not separate
  // rules and not missing-tag defects. Tagged bullets in the span still get
  // their own ID as normal.
  let headingOwnsContent = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    const lineNo = i + 1;

    if (/^###?\s/.test(line)) {
      legendActive = line.startsWith('### Legend');

      const section = sectionForHeading(line, config.headingSection);

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

    if (config.taggedParagraphLines.includes(lineNo)) {
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

// Reads `version:` from the spec's leading YAML frontmatter, so the generated
// header reflects the spec's real version instead of a hardcoded string.
const sourceVersion = (sourceText: string): string => {
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(sourceText)?.[1] ?? '';

  return /^version:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim() ?? 'unknown';
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

export const buildRuleSpec = (config: ComponentSpecConfig, sourceText: string): string => {
  const actualHash = createHash('sha256')
    .update(sourceText)
    .digest('hex');

  if (actualHash !== config.expectedHash) {
    throw new Error(
      `${config.sourceFile} has changed since ${config.rulesFile}'s extraction tables `
      + `were last reviewed against it (expected sha256 ${config.expectedHash}, got ${actualHash}). `
      + 'Review every line-number entry in this component\'s config, update them as '
      + 'needed, then update its expectedHash.',
    );
  }

  const base = basename(config.sourceFile);
  const lines = sourceText.split('\n');
  const blocks = parseBlocks(lines, config);

  const bySection = new Map<string, RuleEntry[]>();
  const governance: RuleEntry[] = [];
  const untagged: Array<{line: number; summary: string}> = [];
  const untestable: RuleEntry[] = [];
  const ambiguous: Array<RuleEntry & {duplicateOf?: string}> = [];
  const counters = new Map<string, number>();

  const nextId = (section: string): string => {
    const n = (counters.get(section) ?? 0) + 1;

    counters.set(section, n);

    return `${config.prefix}-${section}-${String(n).padStart(2, '0')}`;
  };

  for (const block of blocks) {
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

    const redirect = config.redirects.find((r) => r.line === block.line);

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

    const split = config.splits.find((s) => s.line === block.line);

    if (split) {
      const target = split.destination === 'untestable' ? untestable : ambiguous;

      target.push({id: split.extraId, tag: block.tag, line: block.line, summary: split.summary});
    }
  }

  const lines_out: string[] = [];

  lines_out.push(`# ${config.displayName} — Test Rule Extraction`);
  lines_out.push('');
  lines_out.push(`Generated from \`${config.sourceFile}\` (version: ${sourceVersion(sourceText)}) by`);
  lines_out.push('`src/tests/tools/generate-rule-spec.ts`. Do not hand-edit — rerun the');
  lines_out.push(`generator instead. The generator refuses to run if \`${base}\` no longer`);
  lines_out.push('matches the hash its extraction tables were reviewed against; `yarn');
  lines_out.push('check:spec-coverage` also fails if this file drifts from a fresh run.');
  lines_out.push('');
  lines_out.push('## Legend');
  lines_out.push('');
  lines_out.push('- **[CODE]** / **[DS + CODE]** — in scope for a real test.');
  lines_out.push('- **[DS]** — out of scope: design-system governance a single component');
  lines_out.push('  test cannot verify. Listed for traceability, not tested.');

  for (const code of config.sectionOrder) {
    const entries = bySection.get(code) ?? [];

    lines_out.push('');
    lines_out.push(`## ${config.sectionNames[code]} (${code})`);
    lines_out.push('');

    if (entries.length === 0) {
      lines_out.push('_(no CODE/DS + CODE rules in this section)_');
    } else {
      for (const entry of entries) {
        lines_out.push(`- **${entry.id}** \`[${entry.tag}]\` (${base}:${entry.line}) — ${entry.summary}`);
      }
    }
  }

  lines_out.push('');
  // The '## Design-system governance' heading is matched verbatim by
  // readRules() in check-spec-coverage.ts to classify governance rules — keep
  // the two in sync.
  lines_out.push('## Design-system governance — out of scope');
  lines_out.push('');
  lines_out.push('Pure `[DS]` rules. Listed for traceability; none of these get a test.');
  lines_out.push('');

  for (const entry of governance) {
    lines_out.push(`- **${entry.id}** \`[DS]\` (${base}:${entry.line}) — ${entry.summary}`);
  }

  lines_out.push('');
  lines_out.push('## Untagged bullets — spec defect');
  lines_out.push('');
  lines_out.push('Bullets with no `[CODE]`/`[DS]`/`[DS + CODE]` tag in the source. Not');
  lines_out.push('classified, not tested.');
  lines_out.push('');

  for (const u of untagged) {
    lines_out.push(`- (${base}:${u.line}) "${u.summary}" — no tag in the source.`);
  }

  lines_out.push('');
  lines_out.push('## Untestable as written — spec defect');
  lines_out.push('');
  lines_out.push('Tagged rules that can\'t produce a single clean assertion because the');
  lines_out.push('spec omits a value.');
  lines_out.push('');

  for (const entry of untestable) {
    lines_out.push(`- **${entry.id}** \`[${entry.tag}]\` (${base}:${entry.line}) — ${entry.summary}`);
  }

  lines_out.push('');
  lines_out.push('## Ambiguous or duplicate bullets');
  lines_out.push('');
  lines_out.push('Tagged rules that can\'t produce a single clean assertion because they');
  lines_out.push('state two acceptable outcomes, or restate another rule.');
  lines_out.push('');

  for (const entry of ambiguous) {
    const dup = entry.duplicateOf ? ` duplicates **${entry.duplicateOf}**` : '';

    lines_out.push(`- **${entry.id}** \`[${entry.tag}]\` (${base}:${entry.line})${dup} — ${entry.summary}`);
  }

  lines_out.push('');

  return lines_out.join('\n');
};
