import {NdwuSpokesLoaderComponent} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType} from '@sb/helpers/arg-types';

type Story = StoryObj<NdwuSpokesLoaderComponent>;

const meta: Meta<NdwuSpokesLoaderComponent> = {
  title: 'Core/Spokes Loader',
  component: NdwuSpokesLoaderComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Small spinner of fading spokes for inline loading states. Decorative: it has no role or accessible name, so put a text or a live region next to it.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    size: {
      control: {type: 'number', min: 8, max: 200, step: 1},
      description: 'Width and height in px',
    },
    spokes: {
      control: {type: 'range', min: 3, max: 12, step: 1},
      description: 'Number of spokes; clamped to 3–12',
    },
    duration: {
      control: {type: 'number', min: 100, step: 100},
      description: 'One full fade cycle in ms',
    },
    spokeWidth: {
      control: {type: 'number', min: 0.5, step: 0.5},
      description: 'Spoke width in px; also the corner radius',
    },
    spokeHeight: {
      control: {type: 'number', min: 0, step: 0.5},
      description: 'Spoke length in px; `0` = auto (20.2 % of `size`)',
    },
    spokeOffset: {
      control: {type: 'number', min: 0, step: 0.5},
      description: 'Gap from the outer edge to the spoke in px; empty = auto (8.65 % of `size`)',
    },
    autostart: booleanArgType(
      'Starts the internal animation loop when `true`. The spokes animate through CSS either way, so the value has no visible effect',
    ),
    startAnimation: {table: {disable: true}},
    stopAnimation: {table: {disable: true}},
  },
  args: {
    size: 20,
    spokes: 8,
    duration: 900,
    spokeWidth: 1.5,
    spokeHeight: 0,
    spokeOffset: null,
    autostart: true,
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-spokes-loader ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {};
