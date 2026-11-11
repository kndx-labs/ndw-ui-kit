import {NDWU_ICON_NAME, NDWU_SIZE, NdwuBadgeComponent, NdwuBadgeTone} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, iconArgType, sizeArgType, textArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type BadgeStoryArgs = NdwuBadgeComponent & SizeArg & {
  content: string;
};

type Story = StoryObj<BadgeStoryArgs>;

const TONES: readonly NdwuBadgeTone[] = ['gray', 'negative', 'positive', 'warning', 'blue', 'violet', 'cyan', 'white'];
const SIZES = [NDWU_SIZE.S, NDWU_SIZE.L, NDWU_SIZE.XL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const ICON = NDWU_ICON_NAME.BELL_ON_S;

const meta: Meta<BadgeStoryArgs> = {
  title: 'Core/Badge',
  component: NdwuBadgeComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component: 'Compact read-only label in eight tones, with an optional icon (L and XL) and truncation by `maxWidth`.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    tone: {
      control: 'select',
      options: TONES,
      description: 'Colour scheme of the badge',
    },
    icon: {
      ...iconArgType,
      description: 'Icon shown before the text at sizes L and XL',
    },
    maxWidth: textArgType('CSS max width, e.g. `120px`; the text is cut with an ellipsis'),
    disabled: booleanArgType('Dims the badge; it is not interactive either way'),
    ariaLabel: textArgType(
      'Accessible name. The badge has no role, so screen readers usually read the text instead; keep the text meaningful',
    ),
    size: {
      ...sizeArgType(SIZES),
      description:
        'Component size. `inherit` takes it from the Size toolbar or the nearest size provider, else `XL`; the icon shows only at L and XL. An inherited `XXL` has no styles; the Size toolbar previews only S, L and XL',
    },
    content: {
      control: 'text',
      description: 'Projected badge text',
      table: {category: 'story'},
    },
  },
  args: {
    tone: 'gray',
    icon: null,
    maxWidth: null,
    disabled: false,
    ariaLabel: null,
    content: 'Badge label',
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-badge ${argsToTemplate(args, {exclude: ['content']})}>{{ content }}</ndwu-badge>`,
  }),
};

export default meta;

export const Default: Story = {};

export const Tones: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {description: {story: 'Every tone, text only and with an icon.'}},
  },
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      group(TONES.map((tone) => `<ndwu-badge tone="${tone}">${tone}</ndwu-badge>`)),
      group(TONES.map((tone) => `<ndwu-badge tone="${tone}" icon="${ICON}">${tone}</ndwu-badge>`)),
    ]),
  }),
};

export const Sizes: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {description: {story: 'The icon shows at L and XL; at S the badge is text only.'}},
  },
  decorators: [withRowLayout],
  render: () => ({
    template: lines(
      SIZES.map((size) => `<ndwu-badge tone="blue" size="${size}" icon="${ICON}">Size ${size}</ndwu-badge>`),
    ),
  }),
};

export const Truncation: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: '`maxWidth` caps the badge; the text ends with an ellipsis. The full text stays in the DOM.',
      },
    },
  },
  decorators: [withRowLayout],
  render: () => ({
    template: '<ndwu-badge maxWidth="120px">Very long label that truncates here</ndwu-badge>',
  }),
};

export const Numbers: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Width follows the content: a single digit gives a near-round badge, longer numbers widen it. `ariaLabel` names what the number counts.',
      },
    },
  },
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      '<ndwu-badge tone="negative" ariaLabel="1 notification">1</ndwu-badge>',
      '<ndwu-badge tone="negative" ariaLabel="1000 notifications">1000</ndwu-badge>',
    ]),
  }),
};
