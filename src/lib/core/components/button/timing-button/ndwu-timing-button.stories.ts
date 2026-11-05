import {NDWU_ICON_NAME, NDWU_SIZE, type NdwuSize, NdwuTimingButtonComponent} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {eventArgType, iconArgType, outputArgType, sizeArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {withRowLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type TimingButtonStoryArgs = NdwuTimingButtonComponent & SizeArg & {
  click: (event: MouseEvent) => void;
};

type Story = StoryObj<TimingButtonStoryArgs>;

const SIZES: readonly NdwuSize[] = Object.values(NDWU_SIZE);
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const meta: Meta<TimingButtonStoryArgs> = {
  title: 'Core/Button/Timing Button',
  component: NdwuTimingButtonComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component: 'Button with a countdown that ends on user click or timeout.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    leftText: {
      description: 'Text shown before the countdown; passed through the `localize` pipe',
    },
    rightText: {
      description: 'Text shown after the countdown; passed through the `localize` pipe',
    },
    duration: {
      control: 'number',
      description: 'Countdown duration in seconds. Read when the countdown starts, resumes after `loading`, or restarts after `disabled`; a change while counting applies only then.',
    },
    width: {
      description: 'CSS width of the button',
    },
    icon: {
      ...iconArgType,
      description: 'Icon shown instead of text',
    },
    disabled: {
      description: 'Disables the button and resets the countdown',
    },
    loading: {
      description: 'Shows a spinner and pauses the countdown',
    },
    size: sizeArgType(SIZES),
    timerEnd: outputArgType('timerEnd', 'Emits `\'user\'` on click or `\'timeout\'` when the countdown reaches zero'),
    click: eventArgType('click', 'Native click event; also emitted when the countdown times out'),
  },
  args: {
    leftText: 'Confirm',
    rightText: 's',
    duration: 15,
    width: null,
    icon: null,
    disabled: false,
    loading: false,
    size: undefined,
  },
  render: (args) => {
    const argsStr = argsToTemplate(args, {exclude: ['duration']});

    return {
      props: args,
      template: `
        <button
          ndwu-timing-button
          [duration]="${args.duration}"
          ${argsStr}
        >
        </button>`,
    };
  },
};

export default meta;

export const Default: Story = {};

export const Idle: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  render: () => {
    return {
      template: `
        <button
          ndwu-timing-button
          leftText="Confirm"
          rightText="s"
          [duration]="0"
        >
        </button>`,
    };
  },
};

export const States: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => {
    return {
      template: lines([
        `<button
          ndwu-timing-button
          leftText="Disabled"
          [duration]="0"
          [disabled]="true"
        >
        </button>`,
        `<button
          ndwu-timing-button
          leftText="Loading"
          [duration]="0"
          [loading]="true"
        >
        </button>`,
      ]),
    };
  },
};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => {
    return {
      template: lines(
        SIZES.map((size) => {
          return `
            <button
              ndwu-timing-button
              size="${size}"
              leftText="Size ${size}"
              [duration]="0"
            >
            </button>`;
        }),
      ),
    };
  },
};

export const WithIcon: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  render: () => {
    return {
      template: `
        <button
          ndwu-timing-button
          icon="${NDWU_ICON_NAME.ADD_S}"
          [duration]="0"
          aria-label="Confirm"
        >
        </button>`,
    };
  },
};
