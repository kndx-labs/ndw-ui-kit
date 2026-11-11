export interface IntroductionCard {
  group: string;
  name: string;
  docsId: string;
  description: string;
  ready: boolean;
}

export const INTRODUCTION_CARDS: readonly IntroductionCard[] = [
  {
    group: 'Core',
    name: 'Button',
    docsId: 'core-button-button--docs',
    description: 'Primary action control with variants and sizes.',
    ready: true,
  },
  {
    group: 'Core',
    name: 'Icon Button',
    docsId: 'core-button-icon-button--docs',
    description: 'Icon-only button in square, round and flat variants.',
    ready: false,
  },
  {
    group: 'Core',
    name: 'Timing Button',
    docsId: 'core-button-timing-button--docs',
    description: 'Button with a countdown that ends on user click or timeout.',
    ready: false,
  },
  {
    group: 'Core',
    name: 'Link',
    docsId: 'core-link--docs',
    description: 'Anchor link with disabled and external states.',
    ready: false,
  },
  {
    group: 'Core',
    name: 'Checkbox',
    docsId: 'core-checkbox--docs',
    description: 'Checkbox with label, secondary text and indeterminate state.',
    ready: false,
  },
  {
    group: 'Core',
    name: 'Radio',
    docsId: 'core-radio--docs',
    description: 'Radio group with options, sizes and disabled states.',
    ready: false,
  },
  {
    group: 'Core',
    name: 'Toggle',
    docsId: 'core-toggle--docs',
    description: 'Switch in brand or green colour.',
    ready: false,
  },
  {
    group: 'Core',
    name: 'Icon',
    docsId: 'core-icon-icon--docs',
    description: 'SVG icon from the kit sprite, sized by its name and coloured by CSS color.',
    ready: false,
  },
  {
    group: 'Core',
    name: 'Adaptive Icon',
    docsId: 'core-icon-adaptive-icon--docs',
    description: 'Icon that switches between S and L by size flags.',
    ready: false,
  },
  {
    group: 'Core',
    name: 'Pictogram',
    docsId: 'core-pictogram-pictogram--docs',
    description: 'Two-colour illustration in five presets or custom colours.',
    ready: false,
  },
  {
    group: 'Core',
    name: 'Adaptive Pictogram',
    docsId: 'core-pictogram-adaptive-pictogram--docs',
    description: 'Pictogram that switches between L and XL by size flags.',
    ready: false,
  },
];
