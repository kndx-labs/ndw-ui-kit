import {ComponentSpecConfig} from './types';

// sha256 of `md_design/dialog.md` as of the last time the tables below were
// reviewed against the spec. buildRuleSpec throws on mismatch. dialog.md has no
// bullets stating two independent claims and none duplicating another rule, so
// splits/redirects are empty — every tagged bullet gets a normal per-section
// ID and the test layer decides test vs it.todo vs FINDINGS (see
// src/tests/dialog/FINDINGS.md for the three code/spec divergences).
export const dialogConfig: ComponentSpecConfig = {
  prefix: 'DLG',
  displayName: 'Dialog',
  sourceFile: 'md_design/dialog.md',
  rulesFile: 'src/tests/dialog/dialog.rules.md',
  expectedHash: '9629af44afc365be9d75b14a564d2ee4f8c46032807d3c86af189bb502b91440',
  sectionOrder: ['CLR', 'TYP', 'LAY', 'ELV', 'SHP', 'CMP', 'BHV', 'ACC', 'DOD'],
  sectionNames: {
    CLR: 'Colors',
    TYP: 'Typography',
    LAY: 'Layout',
    ELV: 'Elevation & Depth',
    SHP: 'Shapes',
    CMP: 'Components',
    BHV: 'Behavior',
    ACC: 'Accessibility',
    DOD: 'Do\'s and Don\'ts',
  },
  headingSection: [
    {prefix: 'Colors', code: 'CLR'},
    {prefix: 'Typography', code: 'TYP'},
    {prefix: 'Layout', code: 'LAY'},
    {prefix: 'General composition', code: 'LAY'},
    {prefix: 'Sizes & dimensions', code: 'LAY'},
    {prefix: 'Mobile / handset', code: 'LAY'},
    {prefix: 'Context dialog', code: 'LAY'},
    {prefix: 'Elevation & Depth', code: 'ELV'},
    {prefix: 'Shapes', code: 'SHP'},
    {prefix: 'Components', code: 'CMP'},
    {prefix: 'When to use', code: 'CMP'},
    {prefix: 'When NOT to use', code: 'CMP'},
    {prefix: 'Behavior', code: 'BHV'},
    {prefix: 'Accessibility', code: 'ACC'},
    {prefix: 'Do\'s and Don\'ts', code: 'DOD'},
  ],
  splits: [],
  redirects: [],
  taggedParagraphLines: [],
};
