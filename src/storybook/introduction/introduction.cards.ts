export interface IntroductionCard {
  group: string;
  name: string;
  docsId: string;
  description: string;
  ready: boolean;
}

export const INTRODUCTION_CARDS: readonly IntroductionCard[] = [
  {
    group: 'Foundations',
    name: 'Icon Registry',
    docsId: 'foundations-icon-registry--docs',
    description: 'Every icon with its name, filtered by name and size.',
    ready: false,
  },
  {
    group: 'Foundations',
    name: 'Pictogram Registry',
    docsId: 'foundations-pictogram-registry--docs',
    description: 'Every pictogram with its name, filtered by name and size.',
    ready: false,
  },
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
    name: 'Textarea',
    docsId: 'core-textarea--docs',
    description: 'Multi-line text with line numbers, actions, loading and resize.',
    ready: false,
  },
  {
    group: 'Form Field',
    name: 'Input Field',
    docsId: 'form-field-input-field--docs',
    description: 'Text or password input with label, hint and validation for reactive forms.',
    ready: false,
  },
  {
    group: 'Form Field',
    name: 'Password Input Field',
    docsId: 'form-field-password-input-field--docs',
    description: 'Password input with show/hide button and strength indicator.',
    ready: false,
  },
  {
    group: 'Form Field',
    name: 'Textarea Field',
    docsId: 'form-field-textarea-field--docs',
    description: 'Textarea with label, hint and validation for reactive forms.',
    ready: false,
  },
  {
    group: 'Form Field',
    name: 'Schedule Editor Field',
    docsId: 'form-field-schedule-editor-field--docs',
    description: 'Schedule editor bound to a reactive form control.',
    ready: false,
  },
  {
    group: 'Widgets',
    name: 'Schedule Editor',
    docsId: 'widgets-schedule-editor--docs',
    description: 'Weekly schedule grid with drag to add or remove time, full and thumbnail modes.',
    ready: false,
  },
];
