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
    name: 'Tabs',
    docsId: 'core-tabs--docs',
    description: 'Tab bar in default and bordered variants with icons, badges and horizontal scrolling.',
    ready: false,
  },
];
