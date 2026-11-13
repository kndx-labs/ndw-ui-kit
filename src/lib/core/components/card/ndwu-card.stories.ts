import {NDWU_SIZE, NdwuCardComponent} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {sizeArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type CardStoryArgs = NdwuCardComponent & SizeArg & {
  content: string;
};

type Story = StoryObj<CardStoryArgs>;

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const meta: Meta<CardStoryArgs> = {
  title: 'Core/Card',
  component: NdwuCardComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component: 'Bordered container with padding by size; content is projected as is.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    size: {
      ...sizeArgType(SIZES),
      description:
        'Component size: padding 16 / 24 / 32 px for L / XL / XXL. `inherit` takes it from the Size toolbar or the nearest size provider, else `XL`; an inherited `S` renders as `L`. The Size toolbar previews only L, XL and XXL; toolbar S shows the "not supported" note and the card stays at XL',
    },
    content: {
      control: 'text',
      description: 'Projected content; the card sets only text colour and font family',
      table: {category: 'story'},
    },
  },
  args: {
    content: 'Card content goes here.',
  },
  render: (args) => {
    const argsStr = argsToTemplate(args, {exclude: ['content']});

    return {
      props: args,
      template: `<ndwu-card${argsStr ? ` ${argsStr}` : ''}>{{ content }}</ndwu-card>`,
    };
  },
};

export default meta;

export const Default: Story = {};

export const WithTitle: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'The card has no title slot or title styles: put your own heading and text inside. The card sets the text colour and font family; sizes, weights and margins come from the app.',
      },
    },
  },
  render: () => ({
    template: lines([
      '<ndwu-card>',
      '  <h3>Card title</h3>',
      '  <p>Card description text goes here.</p>',
      '</ndwu-card>',
    ]),
  }),
};

export const Sizes: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {description: {story: 'Padding grows with the size; XXL also has a larger corner radius.'}},
  },
  decorators: [withStackLayout],
  render: () => ({
    template: lines(SIZES.map((size) => `<ndwu-card size="${size}">Size ${size}</ndwu-card>`)),
  }),
};
