import {ComponentSpecConfig} from './types';

// sha256 of `md_design/select.md` as of the last table review. buildRuleSpec
// throws on mismatch. No two-claim bullets and no duplicated rules, so
// splits/redirects are empty; the test layer decides test vs it.todo vs
// FINDINGS (see src/tests/select/FINDINGS.md).
export const selectConfig: ComponentSpecConfig = {
  prefix: 'SEL',
  displayName: 'Select',
  sourceFile: 'md_design/select.md',
  rulesFile: 'src/tests/select/select.rules.md',
  expectedHash: '13e244851279ad3658639b2c8a245e179b8d40143d26446774174e7fa0060366',
  sectionOrder: ['CLR', 'TYP', 'LAY', 'ELV', 'SHP', 'MOT', 'CMP', 'ACC', 'DOD'],
  sectionNames: {
    CLR: 'Colors',
    TYP: 'Typography',
    LAY: 'Layout',
    ELV: 'Elevation & Depth',
    SHP: 'Shapes',
    MOT: 'Motion',
    CMP: 'Components',
    ACC: 'Accessibility',
    DOD: 'Do\'s and Don\'ts',
  },
  headingSection: [
    {prefix: 'Colors', code: 'CLR'},
    {prefix: 'Typography', code: 'TYP'},
    {prefix: 'Layout', code: 'LAY'},
    {prefix: 'Sizes', code: 'LAY'},
    {prefix: 'Option width', code: 'LAY'},
    {prefix: 'Grouping / row padding per size', code: 'LAY'},
    {prefix: 'Mobile', code: 'LAY'},
    {prefix: 'Elevation & Depth', code: 'ELV'},
    {prefix: 'Shapes', code: 'SHP'},
    {prefix: 'Motion', code: 'MOT'},
    {prefix: 'Components', code: 'CMP'},
    {prefix: 'Select field', code: 'CMP'},
    {prefix: 'Helper text defaults', code: 'CMP'},
    {prefix: 'Dropdown menu', code: 'CMP'},
    {prefix: 'Behavior & keyboard', code: 'ACC'},
    {prefix: 'Do\'s and Don\'ts', code: 'DOD'},
  ],
  splits: [],
  redirects: [],
  taggedParagraphLines: [],
};
