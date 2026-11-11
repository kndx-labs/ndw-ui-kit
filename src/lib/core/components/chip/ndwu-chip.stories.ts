import {
  NDWU_CHIP_STATUS,
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuChipComponent,
  NdwuChipStatus,
  NdwuIconName,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, eventArgType, iconArgType, sizeArgType, textArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type ChipStoryArgs = NdwuChipComponent & SizeArg & {
  click: (event: MouseEvent) => void;
};

type Story = StoryObj<ChipStoryArgs>;

const STATUSES: readonly NdwuChipStatus[] = Object.values(NDWU_CHIP_STATUS);
const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const ICON = NDWU_ICON_NAME.DOWNLOAD_S;

const STATUS_ICONS: Readonly<Record<NdwuChipStatus, NdwuIconName>> = {
  [NDWU_CHIP_STATUS.DEFAULT]: NDWU_ICON_NAME.DOWNLOAD_S,
  [NDWU_CHIP_STATUS.POSITIVE]: NDWU_ICON_NAME.CHECK_S,
  [NDWU_CHIP_STATUS.NEGATIVE]: NDWU_ICON_NAME.CLOSE_S,
};

const chip = (attributes: string): string => {
  return `<button ndwu-chip ${attributes}></button>`;
};

const storyDescription = (story: string): NonNullable<Story['parameters']> => {
  return {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {story},
    },
  };
};

const meta: Meta<ChipStoryArgs> = {
  title: 'Core/Chip',
  component: NdwuChipComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Action chip on `<button ndwu-chip>` in three statuses, with an optional icon, an icon-only form and a loading state.',
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
      description: 'Colour scheme of the chip',
    },
    icon: {
      ...iconArgType,
      description: 'Icon shown before the label; replaced by a spinner while `loading`',
    },
    label: textArgType(
      'Label text, passed through the `localize` pipe. When empty, projected content is shown; an icon with no text makes the chip icon-only',
    ),
    disabled: booleanArgType('Disables the chip'),
    loading: booleanArgType('Shows a spinner instead of the icon, disables the button and sets `aria-busy`'),
    maxWidth: textArgType('CSS max width, e.g. `120px`; the label is cut with an ellipsis'),
    ariaLabel: textArgType('Accessible name; required for an icon-only chip'),
    size: {
      ...sizeArgType(SIZES),
      description:
        'Component size. `inherit` takes it from the Size toolbar or the nearest size provider, else `XL`. Under a size provider, `S` renders as `L` and `XXL` as `XL`; the Size toolbar previews only `L` and `XL`',
    },
    click: eventArgType('click', 'Native click event'),
  },
  args: {
    status: NDWU_CHIP_STATUS.DEFAULT,
    icon: ICON,
    label: 'Chip label',
    disabled: false,
    loading: false,
    maxWidth: null,
    ariaLabel: null,
  },
  render: (args) => ({
    props: args,
    template: `<button ndwu-chip ${argsToTemplate(args)}></button>`,
  }),
};

export default meta;

export const Default: Story = {};

export const Statuses: Story = {
  parameters: storyDescription(
    'Each status with an icon and a label, a label only, and an icon only. An icon-only chip needs `ariaLabel`.',
  ),
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      group(
        STATUSES.map((status) => chip(`status="${status}" icon="${STATUS_ICONS[status]}" label="${status} chip"`)),
      ),
      group(STATUSES.map((status) => chip(`status="${status}" label="${status} chip"`))),
      group(
        STATUSES.map((status) => chip(`status="${status}" icon="${STATUS_ICONS[status]}" ariaLabel="${status} chip"`)),
      ),
    ]),
  }),
};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      SIZES.map((size) =>
        group([
          chip(`size="${size}" icon="${ICON}" label="Size ${size}"`),
          chip(`size="${size}" label="Size ${size}"`),
          chip(`size="${size}" icon="${ICON}" ariaLabel="Size ${size}"`),
        ])
      ),
    ),
  }),
};

export const Loading: Story = {
  parameters: storyDescription(
    '`loading` shows a spinner instead of the icon, disables the button and sets `aria-busy`.',
  ),
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      chip('label="Updating" [loading]="true"'),
      chip('ariaLabel="Updating" [loading]="true"'),
    ]),
  }),
};

export const Disabled: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: chip(`icon="${ICON}" label="Unavailable" [disabled]="true"`),
  }),
};

export const ProjectedContent: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      `<button ndwu-chip icon="${ICON}">Projected label</button>`,
      '<button ndwu-chip>Projected, no icon</button>',
    ]),
  }),
};

export const Truncation: Story = {
  parameters: storyDescription(
    'A chip has no built-in label limit. `maxWidth` caps its width and the label ends with an ellipsis.',
  ),
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      chip(`maxWidth="120px" icon="${ICON}" label="Narrow container"`),
      chip(`maxWidth="160px" icon="${ICON}" label="Very long chip label that gets cut"`),
    ]),
  }),
};
