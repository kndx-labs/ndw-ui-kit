import {ComponentSpecConfig} from './types';

// sha256 of `md_design/button.md` as of the last time the tables below (all
// keyed to specific line numbers and headings) were reviewed against the spec.
// buildRuleSpec throws on mismatch; if that fires, re-review every entry below
// against the new spec text, then update expectedHash.
export const buttonConfig: ComponentSpecConfig = {
  prefix: 'BTN',
  displayName: 'Button',
  sourceFile: 'md_design/button.md',
  rulesFile: 'src/tests/button/button.rules.md',
  expectedHash: 'aedc095f5c866e06bad5f0ed0df758e50bd40b18a0be2643434b8fad5ae46d2f',
  sectionOrder: ['CLR', 'TYP', 'LAY', 'ELV', 'SHP', 'VAR', 'CMP', 'STA', 'ACC', 'DOD'],
  sectionNames: {
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
  },
  headingSection: [
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
  ],
  splits: [
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
  ],
  redirects: [
    {
      line: 134,
      destination: 'untestable',
      summary: 'hover drop-shadow: "subtle", no token or value given',
    },
    {
      line: 251,
      destination: 'ambiguous',
      summary: 'the accessible-name rule stated twice',
      duplicateOf: 'BTN-ACC-01',
    },
  ],
  taggedParagraphLines: [160],
};
