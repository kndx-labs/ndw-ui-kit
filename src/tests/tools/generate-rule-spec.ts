import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

// sha256 of `md_design/button.md` as of the last time SPLITS/REDIRECTS/
// HEADING_SECTION below (all keyed to specific line numbers and headings)
// were reviewed against the spec. This generator has no way to notice on its
// own that a spec edit shifted a line number out from under one of those
// tables and started silently misclassifying a bullet — a hash mismatch is
// the only signal. If this check fires: diff button.md against the version
// this hash was taken from, re-review every SPLITS/REDIRECTS/HEADING_SECTION
// entry against the new text, update them as needed, then replace this
// constant with the new file's hash.
const EXPECTED_SOURCE_HASH = 'aedc095f5c866e06bad5f0ed0df758e50bd40b18a0be2643434b8fad5ae46d2f';

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

// Reads `version:` from the spec's leading YAML frontmatter, so the generated
// header reflects the spec's real version instead of a hardcoded string that
// silently drifts when the spec is revised. Falls back to 'unknown' if absent.
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

export const generateRuleSpec = (sourceText: string): string => {
  const actualHash = createHash('sha256')
    .update(sourceText)
    .digest('hex');

  if (actualHash !== EXPECTED_SOURCE_HASH) {
    throw new Error(
      'md_design/button.md has changed since this generator\'s SPLITS/REDIRECTS/'
      + 'HEADING_SECTION tables were last reviewed against it '
      + `(expected sha256 ${EXPECTED_SOURCE_HASH}, got ${actualHash}). `
      + 'Review every hardcoded line-number entry in generate-rule-spec.ts against '
      + 'the new spec text, update them as needed, then update EXPECTED_SOURCE_HASH.',
    );
  }

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
  lines_out.push(`Generated from \`md_design/button.md\` (version: ${sourceVersion(sourceText)}) by`);
  lines_out.push('`src/tests/tools/generate-rule-spec.ts`. Do not hand-edit — rerun the');
  lines_out.push('generator instead. The generator refuses to run if `button.md` no longer');
  lines_out.push('matches the hash its extraction tables were reviewed against; `yarn');
  lines_out.push('check:spec-coverage` also fails if this file drifts from a fresh run.');
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

  try {
    const generated = generateRuleSpec(source);

    writeFileSync(outputPath, generated, 'utf8');
    console.log(`wrote ${outputPath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
