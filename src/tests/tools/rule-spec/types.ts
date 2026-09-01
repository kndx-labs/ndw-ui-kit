export interface Block {
  line: number;        // 1-indexed source line where this block starts
  kind: 'bullet' | 'heading' | 'paragraph';
  text: string;         // full block text, joined
  tag: 'CODE' | 'DS' | 'DS + CODE' | null;
  section: string;      // section code at this point in the document; '' if none yet
}

export interface RuleEntry {
  id: string;
  tag: 'CODE' | 'DS' | 'DS + CODE';
  line: number;
  summary: string;
}

// A source bullet stating two independent claims (one testable, one not): the
// bullet's normal per-section ID is emitted as usual, then this extra ID is
// injected into a special list for the bullet's second claim.
export interface SplitRule {
  line: number;
  extraId: string;
  destination: 'untestable' | 'ambiguous';
  summary: string;
}

// A wholly untestable/ambiguous tagged bullet: its own ID is redirected out of
// the normal per-section list into a special list.
export interface RedirectRule {
  line: number;
  destination: 'untestable' | 'ambiguous';
  summary: string;
  duplicateOf?: string;
}

// Everything component-specific the generator needs. The parsing/formatting
// logic in core.ts is driven entirely by this — no component literals live in
// core. prefix and every section code must be exactly 3 uppercase letters (the
// coverage checker's ID regex depends on it); registry.ts enforces that.
export interface ComponentSpecConfig {
  prefix: string;            // 'BTN', 'DLG'
  displayName: string;       // 'Button', 'Dialog' — the generated H1 word
  sourceFile: string;        // 'md_design/button.md' (repo-root-relative)
  rulesFile: string;         // 'src/tests/button/button.rules.md' (ndw-ui-kit-relative)
  expectedHash: string;      // sha256 of sourceFile at last table review
  sectionOrder: string[];
  sectionNames: Record<string, string>;
  headingSection: Array<{prefix: string; code: string}>;
  splits: SplitRule[];
  redirects: RedirectRule[];
  taggedParagraphLines: number[];   // prose paragraphs that carry their own tag
}
