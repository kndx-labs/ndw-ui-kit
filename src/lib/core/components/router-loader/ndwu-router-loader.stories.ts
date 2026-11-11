import {NdwuRouterLoaderComponent, NdwuRouterLoaderSize} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {textArgType} from '@sb/helpers/arg-types';
import {withRowLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type Story = StoryObj<NdwuRouterLoaderComponent>;

const SIZES: readonly NdwuRouterLoaderSize[] = ['L', 'XL'];
const DURATIONS: readonly number[] = [750, 1500, 3000];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const meta: Meta<NdwuRouterLoaderComponent> = {
  title: 'Core/Router Loader',
  component: NdwuRouterLoaderComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Animated router icon for page and section loading, in theme colours by default. With `ariaLabel` it is a `progressbar`; an empty `ariaLabel` hides it from assistive technologies. Not tied to Angular Router. Stops animating under `prefers-reduced-motion: reduce`.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: SIZES,
      description: 'L is 64 px, XL is 100 px',
    },
    firstColor: {
      control: 'color',
      description:
        'Antennas, frame and LEDs. Any CSS colour, e.g. `var(--ndwu-color-green-40)`; empty uses `--ndwu-router-loader-first-color`',
    },
    secondColor: {
      control: 'color',
      description: 'Shadow under the frame. Any CSS colour; empty uses `--ndwu-router-loader-second-color`',
    },
    duration: {
      control: {type: 'number', min: 500, max: 10000, step: 100},
      description:
        'One full cycle in ms; clamped to 500–10000 (the lower limit keeps the fades under three flashes per second)',
      table: {type: {summary: 'number'}, defaultValue: {summary: '1500'}},
    },
    ariaLabel: textArgType(
      'Accessible name, passed through the `localize` pipe; empty hides the loader from assistive technologies',
    ),
  },
  args: {
    size: 'XL',
    firstColor: '',
    secondColor: '',
    duration: 1500,
    ariaLabel: 'Loading',
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-router-loader ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines(SIZES.map((size) => `<ndwu-router-loader size="${size}" />`)),
  }),
};

export const CustomColors: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'Any CSS colour works. Kit colour tokens follow the theme; a literal hex colour does not.',
      },
    },
  },
  render: () => ({
    template:
      '<ndwu-router-loader size="L" firstColor="var(--ndwu-color-green-40)" secondColor="var(--ndwu-color-green-10)" />',
  }),
};

export const Durations: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'Values are clamped to 500–10000 ms.',
      },
    },
  },
  decorators: [withRowLayout],
  render: () => ({
    template: lines(DURATIONS.map((duration) => `<ndwu-router-loader size="L" [duration]="${duration}" />`)),
  }),
};

export const HiddenFromAssistiveTech: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'With `ariaLabel=""` the SVG gets `aria-hidden="true"` and no `role`, so screen readers skip it. Use it next to visible text that already says what is loading, for example "Loading settings".',
      },
    },
  },
  render: () => ({
    template: '<ndwu-router-loader size="L" ariaLabel="" />',
  }),
};
