import {signal} from '@angular/core';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NDWU_TAG_STATUS,
  NdwuButtonComponent,
  NdwuTagComponent,
  NdwuTagStatus,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {
  booleanArgType,
  eventArgType,
  iconArgType,
  outputArgType,
  sizeArgType,
  textArgType,
} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {withControlledArgs} from '@sb/helpers/story-controlled';
import {withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type TagStoryArgs = NdwuTagComponent & SizeArg & {
  click: (event: MouseEvent) => void;
};

type Story = StoryObj<TagStoryArgs>;

const STATUSES: readonly NdwuTagStatus[] = Object.values(NDWU_TAG_STATUS);
const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const FILTER_TAGS: readonly string[] = ['Router', 'Switch', 'Access point', 'Extender', 'Repeater'];

const tag = (attributes: string): string => {
  return `<button ndwu-tag ${attributes}></button>`;
};

const storyDescription = (story: string): Story['parameters'] => {
  return {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {story},
    },
  };
};

const meta: Meta<TagStoryArgs> = {
  title: 'Core/Tag',
  component: NdwuTagComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Compact label on `<button ndwu-tag>` in seven statuses, with an optional icon, a selected state (`selectable`, `selected` / `selectedChange`) and a remove action (`removable`, `removed`).',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: STATUSES,
      description: 'Colour scheme of the tag',
    },
    icon: {
      ...iconArgType,
      description: 'Icon shown before the label',
    },
    label: textArgType(
      'Label text, passed through the `localize` pipe and cut at about 18 characters. When empty, projected content is shown',
    ),
    selectable: booleanArgType('A click toggles `selected`; sets `aria-pressed`'),
    selected: booleanArgType('Selected state, shown only when `selectable`; update it from `selectedChange`'),
    removable: booleanArgType('Shows the close icon; a click on it, Delete or Backspace emits `removed`'),
    disabled: booleanArgType('Disables the tag'),
    maxWidth: textArgType('CSS max width of the whole tag, e.g. `120px`; replaces the 18-character label limit'),
    ariaLabel: textArgType('Accessible name; replaces the label and the remove label'),
    removeLabel: textArgType(
      'Visually hidden text after the label of a removable tag, passed through the `localize` pipe',
    ),
    size: {
      ...sizeArgType(SIZES),
      description:
        'Component size. `inherit` takes it from the Size toolbar or the nearest size provider, else `XL`. Under a size provider, `S` renders as `L` and `XXL` as `XL`; the Size toolbar previews only `L` and `XL`',
    },
    selectedChange: outputArgType('selectedChange', 'Emits the new selected state when a selectable tag is clicked'),
    removed: outputArgType(
      'removed',
      'Emits on a click on the close icon or Delete / Backspace; the app removes the tag',
    ),
    click: eventArgType('click', 'Native click event; a click on the close icon does not reach it'),
  },
  args: {
    status: NDWU_TAG_STATUS.DEFAULT,
    icon: NDWU_ICON_NAME.MENU_DRAG_S,
    label: 'Tag name',
    selectable: true,
    selected: false,
    removable: true,
    disabled: false,
    maxWidth: null,
    ariaLabel: null,
    removeLabel: 'Remove',
  },
  render: (args) => ({
    props: args,
    template: `<button ndwu-tag ${argsToTemplate(args)}></button>`,
  }),
};

export default meta;

export const Default: Story = {
  decorators: [withControlledArgs('selectedChange', (selected) => ({selected}))],
};

export const Statuses: Story = {
  parameters: storyDescription('Every status at sizes L and XL; the second row of each size is selected.'),
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      SIZES.flatMap((size) => [
        group(
          STATUSES.map((status) => tag(`size="${size}" status="${status}" label="${status}" [removable]="true"`)),
        ),
        group(
          STATUSES.map((status) =>
            tag(
              `size="${size}" status="${status}" label="${status}" [removable]="true" [selectable]="true" [selected]="true"`,
            )
          ),
        ),
      ]),
    ),
  }),
};

export const WithIcon: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      tag(`icon="${NDWU_ICON_NAME.MENU_DRAG_S}" label="Tag name" [removable]="true"`),
      tag(`icon="${NDWU_ICON_NAME.ROUTER_S}" label="25"`),
    ]),
  }),
};

export const LabelOnly: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: tag('label="Tag name"'),
  }),
};

export const Disabled: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      tag('label="Tag name" [removable]="true" [disabled]="true"'),
      tag(`icon="${NDWU_ICON_NAME.MENU_DRAG_S}" label="Tag name" [removable]="true" [disabled]="true"`),
    ]),
  }),
};

export const LongLabel: Story = {
  parameters: storyDescription(
    'The label is cut at about 18 characters (`18ch`) with an ellipsis. `maxWidth` replaces this limit.',
  ),
  decorators: [withRowLayout],
  render: () => ({
    template: tag('label="Very long tag name that gets cut" [removable]="true"'),
  }),
};

export const ProjectedContent: Story = {
  parameters: storyDescription(
    'Without `label` the tag shows its projected content. `maxWidth` caps the whole tag instead of the 18-character label limit.',
  ),
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      '<button ndwu-tag>Projected label</button>',
      '<button ndwu-tag maxWidth="120px">Projected label cut by maxWidth</button>',
    ]),
  }),
};

export const Filter: Story = {
  parameters: storyDescription(
    'The app keeps the list and drops a tag on `removed`. Delete or Backspace on a focused tag removes it too, and focus moves to the next tag. Reset restores the list.',
  ),
  decorators: [withRowLayout, moduleMetadata({imports: [NdwuButtonComponent]})],
  render: () => {
    const filterTags = signal(FILTER_TAGS);

    return {
      props: {
        filterTags,
        removeFilterTag: (removedTag: string) =>
          filterTags.update((tags) => tags.filter((item) => item !== removedTag)),
        resetFilterTags: () => filterTags.set(FILTER_TAGS),
      },
      template: lines([
        '@for (tag of filterTags(); track tag) {',
        `  ${tag('status="info" [label]="tag" [removable]="true" (removed)="removeFilterTag(tag)"')}`,
        '}',
        '<button ndwu-button variant="ghost" label="Reset" (click)="resetFilterTags()"></button>',
      ]),
    };
  },
};
