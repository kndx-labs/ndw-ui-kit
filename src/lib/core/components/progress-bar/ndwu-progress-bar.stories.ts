import {signal} from '@angular/core';
import {
  NDWU_PROGRESS_BAR_COLOR,
  NDWU_SIZE,
  NdwuButtonComponent,
  NdwuProgressBarColor,
  NdwuProgressBarComponent,
  NdwuProgressBarMode,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, sizeArgType, textArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type ProgressBarStoryArgs = NdwuProgressBarComponent & SizeArg;

type Story = StoryObj<ProgressBarStoryArgs>;

interface ColorExample {
  color: NdwuProgressBarColor;
  value: number;
  label: string;
}

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL];
const COLORS = Object.values(NDWU_PROGRESS_BAR_COLOR);
const MODES: readonly NdwuProgressBarMode[] = ['determinate', 'indeterminate'];
const PROGRESS_STATES = [0, 25, 50, 75, 100];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const STEP = 10;
const STEP_MS = 400;

const COLOR_EXAMPLES: readonly ColorExample[] = [
  {color: NDWU_PROGRESS_BAR_COLOR.PRIMARY, value: 65, label: 'Primary'},
  {color: NDWU_PROGRESS_BAR_COLOR.SUCCESS, value: 100, label: 'Success'},
  {color: NDWU_PROGRESS_BAR_COLOR.DANGER, value: 45, label: 'Danger'},
  {color: NDWU_PROGRESS_BAR_COLOR.WARNING, value: 78, label: 'Warning'},
];

const ANIMATED_TEMPLATE = lines([
  group(['<button ndwu-button variant="secondary" label="Simulate upload" (click)="start()"></button>']),
  '<ndwu-progress-bar [value]="progress()" label="Upload progress" />',
]);

const meta: Meta<ProgressBarStoryArgs> = {
  title: 'Core/Progress Bar',
  component: NdwuProgressBarComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Horizontal bar with determinate progress (`value` of `max`) or an indeterminate loop; `label` gives it an accessible name.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    value: {
      control: {type: 'number', min: 0, step: 1},
      description: 'Current value; the fill is `value / max`, capped at 100 %',
    },
    max: {
      control: {type: 'number', min: 0, step: 1},
      description: 'Value of a full bar; 0 shows an empty bar',
    },
    color: {
      control: 'select',
      options: COLORS,
      description: 'Fill colour; unknown values fall back to `primary`',
    },
    label: textArgType(
      'Accessible name (`aria-label`), not shown on screen; name what is progressing (for example `Upload progress`). Required: a progress bar without a name fails the a11y check',
    ),
    disabled: booleanArgType('Grey track and fill; sets `aria-disabled`'),
    mode: {
      control: 'select',
      options: MODES,
      description: '`indeterminate` loops the fill and leaves out `aria-valuenow`; `value` and `max` are ignored',
    },
    size: sizeArgType(SIZES),
  },
  args: {
    value: 50,
    max: 100,
    color: NDWU_PROGRESS_BAR_COLOR.PRIMARY,
    label: 'Upload progress',
    disabled: false,
    mode: 'determinate',
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-progress-bar ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(SIZES.map((size) => `<ndwu-progress-bar size="${size}" [value]="65" label="Size ${size}" />`)),
  }),
};

export const Colors: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      COLOR_EXAMPLES.map(({color, value, label}) =>
        `<ndwu-progress-bar color="${color}" [value]="${value}" label="${label}" />`
      ),
    ),
  }),
};

export const ProgressStates: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      PROGRESS_STATES.map((value) => {
        const color = value === 100 ? NDWU_PROGRESS_BAR_COLOR.SUCCESS : NDWU_PROGRESS_BAR_COLOR.PRIMARY;

        return `<ndwu-progress-bar color="${color}" [value]="${value}" label="${value}%" />`;
      }),
    ),
  }),
};

export const Disabled: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      '<ndwu-progress-bar color="primary" [value]="50" [disabled]="true" label="Disabled primary" />',
      '<ndwu-progress-bar color="success" [value]="100" [disabled]="true" label="Disabled success" />',
    ]),
  }),
};

export const Indeterminate: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'The fill loops while the duration is unknown; there is no `aria-valuenow`. The Size toolbar applies.',
      },
    },
  },
  render: () => ({
    template: '<ndwu-progress-bar mode="indeterminate" label="Loading" />',
  }),
};

export const AnimatedValue: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'The app updates `value`; the fill animates each change over 0.3 s. The button steps the bar to 100 % in 10 % steps; `start()` is story code.',
      },
    },
  },
  decorators: [withStackLayout, moduleMetadata({imports: [NdwuButtonComponent]})],
  render: () => {
    const progress = signal(0);
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = (): void => {
      clearInterval(timer);
      progress.set(0);
      timer = setInterval(() => {
        progress.update((value) => Math.min(value + STEP, 100));

        if (progress() === 100) {
          clearInterval(timer);
        }
      }, STEP_MS);
    };

    return {
      props: {progress, start},
      template: ANIMATED_TEMPLATE,
    };
  },
};
