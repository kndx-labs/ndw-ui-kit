import {
  NDWU_ACCORDION_CHEVRON_POSITION,
  NdwuAccordionChevronPosition,
  NdwuAccordionComponent,
  NdwuAccordionContentDirective,
  NdwuAccordionItemComponent,
  NdwuBadgeComponent,
  NdwuCheckboxComponent,
  NdwuToggleComponent,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, outputArgType} from '@sb/helpers/arg-types';
import {withControlledArgs} from '@sb/helpers/story-controlled';
import {lines} from '@sb/helpers/story-template';

type AccordionStoryArgs = NdwuAccordionComponent & Pick<NdwuAccordionItemComponent, 'expanded' | 'disabled'>;

type Story = StoryObj<AccordionStoryArgs>;

interface AccordionExampleItem {
  title: string;
  description: string;
  count: number;
}

const CHEVRON_POSITIONS: readonly NdwuAccordionChevronPosition[] = Object.values(NDWU_ACCORDION_CHEVRON_POSITION);
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const FIRST_ITEM: AccordionExampleItem = {
  title: 'Notifications',
  description: 'Choose which events send you a message and how it is delivered.',
  count: 3,
};

const ITEMS: readonly AccordionExampleItem[] = [
  FIRST_ITEM,
  {title: 'Backups', description: 'Snapshots are created daily and kept for 30 days.', count: 1},
  {title: 'Access control', description: 'Manage who can view and edit shared resources.', count: 2},
];

const SINGLE_ITEM_ATTRIBUTES: readonly string[] = [' [expanded]="true"'];
const MULTI_ITEM_ATTRIBUTES: readonly string[] = [' [expanded]="true"', ' [expanded]="true"'];
const NESTED_ITEM_ATTRIBUTES: readonly string[] = [' [expanded]="true"', '', ' chevronPosition="start"'];
const DISABLED_ITEM_ATTRIBUTES: readonly string[] = ['', ' [disabled]="true"', ' [disabled]="true" [expanded]="true"'];

const fixedStoryParameters = (story: string): NonNullable<Story['parameters']> => {
  return {...FIXED_STORY_PARAMETERS, docs: {description: {story}}};
};

const indent = (text: string): string => {
  return text
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
};

const element = (open: string, close: string, children: readonly string[]): string => {
  return lines([open, ...children.map(indent), close]);
};

const accordion = (attributes: string, items: readonly string[]): string => {
  return element(`<ndwu-accordion${attributes}>`, '</ndwu-accordion>', items);
};

const accordionItem = (attributes: string, children: readonly string[]): string => {
  return element(`<ndwu-accordion-item${attributes}>`, '</ndwu-accordion-item>', children);
};

const header = (title: string): string => {
  return `<span ndwuAccordionHeader>${title}</span>`;
};

const content = (text: string): string => {
  return `<div ndwuAccordionContent>${text}</div>`;
};

const meta: Meta<AccordionStoryArgs> = {
  title: 'Core/Accordion',
  component: NdwuAccordionComponent,
  subcomponents: {NdwuAccordionItemComponent},
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        NdwuAccordionItemComponent,
        NdwuAccordionContentDirective,
        NdwuBadgeComponent,
        NdwuCheckboxComponent,
        NdwuToggleComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Expandable sections: `ndwu-accordion` with `ndwu-accordion-item`s. One item is open at a time unless `multi`; arrow keys, Home and End move between headers.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    multi: booleanArgType('Lets several items be expanded at once; otherwise expanding an item collapses the others'),
    chevronPosition: {
      control: 'select',
      options: CHEVRON_POSITIONS,
      description:
        'Chevron side for every item; `chevronPosition` on an item overrides it. At `end` the content has no start indent',
    },
    expanded: {
      ...booleanArgType('First item: expanded state; update it from `expandedChange`'),
      table: {category: 'item inputs'},
    },
    disabled: {
      ...booleanArgType('First item: the user cannot toggle it and arrow keys skip it; `expanded` still works'),
      table: {category: 'item inputs'},
    },
    expandedChange: {
      ...outputArgType(
        'expandedChange',
        'First item: emits the new expanded state on a click, and `false` when single mode collapses it',
      ),
      table: {category: 'item outputs'},
    },
  },
  args: {
    multi: false,
    chevronPosition: NDWU_ACCORDION_CHEVRON_POSITION.START,
    expanded: true,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: accordion(` ${argsToTemplate(args, {include: ['multi', 'chevronPosition']})}`, [
      accordionItem(` ${argsToTemplate(args, {include: ['expanded', 'disabled', 'expandedChange']})}`, [
        header(FIRST_ITEM.title),
        content(FIRST_ITEM.description),
      ]),
      ...ITEMS.slice(1).map(({title, description}) => accordionItem('', [header(title), content(description)])),
    ]),
  }),
};

export default meta;

export const Default: Story = {
  decorators: [withControlledArgs('expandedChange', (expanded) => ({expanded}))],
};

export const Single: Story = {
  parameters: fixedStoryParameters(
    'One item is open at a time: expanding an item collapses the others. Header actions (`ndwuAccordionHeaderActions`) sit at the end of the header; a click on them does not toggle the item.',
  ),
  render: () => ({
    template: accordion(
      '',
      ITEMS.map(({title, description}, index) =>
        accordionItem(SINGLE_ITEM_ATTRIBUTES[index] ?? '', [
          header(title),
          '<ndwu-checkbox ndwuAccordionHeaderActions label="Enabled" [checked]="true" />',
          content(description),
        ])
      ),
    ),
  }),
};

export const Multi: Story = {
  parameters: fixedStoryParameters('`multi` lets several items stay expanded.'),
  render: () => ({
    template: accordion(
      ' [multi]="true"',
      ITEMS.map(({title, description}, index) =>
        accordionItem(MULTI_ITEM_ATTRIBUTES[index] ?? '', [
          header(title),
          `<ndwu-toggle ndwuAccordionHeaderActions aria-label="${title}"${index === 0 ? ' [checked]="true"' : ''} />`,
          content(description),
        ])
      ),
    ),
  }),
};

export const ChevronEnd: Story = {
  parameters: fixedStoryParameters(
    '`chevronPosition="end"` puts the chevron after the header actions; the content loses its start indent.',
  ),
  render: () => ({
    template: accordion(
      ' chevronPosition="end"',
      ITEMS.map(({title, description, count}) =>
        accordionItem('', [
          header(title),
          `<ndwu-badge ndwuAccordionHeaderActions tone="blue">${count}</ndwu-badge>`,
          content(description),
        ])
      ),
    ),
  }),
};

export const Nested: Story = {
  parameters: fixedStoryParameters(
    'An accordion inside the content of an item keeps its own single or multi mode and arrow-key navigation. `chevronPosition` on an item overrides the one of its accordion: see the last inner item and the second outer item.',
  ),
  render: () => ({
    template: accordion(' [multi]="true"', [
      accordionItem(' [expanded]="true"', [
        header('Outer item: chevron at the start (inherited)'),
        element('<div ndwuAccordionContent>', '</div>', [
          accordion(
            ' [multi]="true" chevronPosition="end"',
            ITEMS.map(({title, description}, index) =>
              accordionItem(NESTED_ITEM_ATTRIBUTES[index] ?? '', [header(title), content(description)])
            ),
          ),
        ]),
      ]),
      accordionItem(' chevronPosition="end"', [
        header('Outer item: chevron at the end (item override)'),
        content(FIRST_ITEM.description),
      ]),
    ]),
  }),
};

export const Disabled: Story = {
  parameters: {
    ...fixedStoryParameters(
      'A disabled item cannot be toggled by the user, and arrow keys skip it. `expanded` still works from code (third item).',
    ),
    a11y: {config: {rules: [{id: 'color-contrast', enabled: false}]}},
  },
  render: () => ({
    template: accordion(
      '',
      ITEMS.map(({title, description}, index) =>
        accordionItem(DISABLED_ITEM_ATTRIBUTES[index] ?? '', [header(title), content(description)])
      ),
    ),
  }),
};

export const LazyContent: Story = {
  parameters: fixedStoryParameters(
    'Content in `<ng-template ndwuAccordionContent>` is created on the first expand and kept after collapse; `<div ndwuAccordionContent>` is always in the DOM. An item also works without `ndwu-accordion`.',
  ),
  render: () => ({
    template: accordionItem('', [
      header('Content is rendered on first expand'),
      element('<ng-template ndwuAccordionContent>', '</ng-template>', [FIRST_ITEM.description]),
    ]),
  }),
};
