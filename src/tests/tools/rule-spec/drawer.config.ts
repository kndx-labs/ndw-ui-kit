import {ComponentSpecConfig} from './types';

// sha256 of `md_design/drawer.md` as of the last table review. buildRuleSpec
// throws on mismatch. No two-claim bullets and no duplicated rules, so
// splits/redirects are empty; the test layer decides test vs it.todo vs
// FINDINGS (see src/tests/drawer/FINDINGS.md).
export const drawerConfig: ComponentSpecConfig = {
  prefix: 'DRW',
  displayName: 'Drawer',
  sourceFile: 'md_design/drawer.md',
  rulesFile: 'src/tests/drawer/drawer.rules.md',
  expectedHash: '8d3a39add93e29e88c9a77b0d5c473cc1cb37d6210f1cc564215c717348f2bae',
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
    {prefix: 'Sizes', code: 'LAY'},
    {prefix: 'Mobile / handset', code: 'LAY'},
    {prefix: 'Elevation & Depth', code: 'ELV'},
    {prefix: 'Shapes', code: 'SHP'},
    {prefix: 'Components', code: 'CMP'},
    {prefix: 'When to use', code: 'CMP'},
    {prefix: 'When NOT to use', code: 'CMP'},
    {prefix: 'Signals', code: 'CMP'},
    {prefix: 'Decision matrix', code: 'CMP'},
    {prefix: 'Behavior', code: 'BHV'},
    {prefix: 'Accessibility', code: 'ACC'},
    {prefix: 'Do\'s and Don\'ts', code: 'DOD'},
  ],
  splits: [],
  redirects: [],
  taggedParagraphLines: [],
};
