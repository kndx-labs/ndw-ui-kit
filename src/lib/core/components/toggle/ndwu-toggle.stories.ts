import {NDWU_SIZE, NDWU_TOGGLE_COLOR, NdwuToggleColor, NdwuToggleComponent} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {outputArgType, sizeArgType} from '@sb/helpers/arg-types';
import {AriaArgs, SizeArg} from '@sb/helpers/story-args';
import {CONTROLLED_STORY_PARAMETERS, withControlledArgs} from '@sb/helpers/story-controlled';
import {SubmitArg, nativeFormTemplate, submitArgType, submitProps, withNativeForm} from '@sb/helpers/story-form';
import {withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type ToggleStoryArgs = NdwuToggleComponent & SizeArg & AriaArgs & SubmitArg;

type Story = StoryObj<ToggleStoryArgs>;

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const COLORS: readonly NdwuToggleColor[] = Object.values(NDWU_TOGGLE_COLOR);
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const meta: Meta<ToggleStoryArgs> = {
  title: 'Core/Toggle',
  component: NdwuToggleComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Switch (`role="switch"`) in brand or green colour; controlled through `checked` and `checkedChange`.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    'checked': {
      description: 'Checked state; update it from `checkedChange`',
    },
    'disabled': {
      description: 'Disables the toggle',
    },
    'color': {
      control: 'select',
      options: COLORS,
      description: 'Track colour when checked; unknown values fall back to `brand`',
    },
    'id': {
      description: 'Id of the native input, for an external `<label for>`; a generated id is used when empty',
    },
    'name': {
      control: 'text',
      description: 'Native `name`, sent with the form',
    },
    'value': {
      control: 'text',
      description: 'Native `value`, sent when checked; the browser sends `on` when unset',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible name when there is no visible label',
    },
    'aria-labelledby': {
      control: 'text',
      description: 'Id of the element that labels the toggle',
    },
    'aria-describedby': {
      control: 'text',
      description: 'Id of the element that describes the toggle',
    },
    'label': {
      description: 'Label text, passed through the `localize` pipe',
    },
    'secondaryText': {
      description: 'Text under the label, passed through the `localize` pipe',
    },
    'size': sizeArgType(SIZES),
    'checkedChange': outputArgType('checkedChange', 'Emits the new checked state on user change'),
    'focused': outputArgType('focused', 'Emits when the native input gets focus'),
    'blurred': outputArgType('blurred', 'Emits when the native input loses focus'),
  },
  args: {
    'checked': false,
    'disabled': false,
    'color': NDWU_TOGGLE_COLOR.BRAND,
    'id': '',
    'name': null,
    'value': null,
    'aria-label': null,
    'aria-labelledby': null,
    'aria-describedby': null,
    'label': 'Enable notifications',
    'secondaryText': 'Receive updates about your account activity',
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-toggle ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {
  parameters: CONTROLLED_STORY_PARAMETERS,
  decorators: [withControlledArgs('checkedChange', (checked) => ({checked}))],
};

export const Colors: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines(
      COLORS.flatMap((color) => [
        `<ndwu-toggle label="Color ${color}" color="${color}" />`,
        `<ndwu-toggle label="Color ${color}, checked" color="${color}" [checked]="true" />`,
      ]),
    ),
  }),
};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      SIZES.map((size) => `<ndwu-toggle size="${size}" label="Size ${size}" secondaryText="Additional text" />`),
    ),
  }),
};

export const States: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      '<ndwu-toggle label="Checked" [checked]="true" />',
      '<ndwu-toggle label="Disabled" [disabled]="true" />',
      '<ndwu-toggle label="Disabled checked" [checked]="true" [disabled]="true" />',
    ]),
  }),
};

export const Labels: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      '<ndwu-toggle label="Enable feature" />',
      '<ndwu-toggle label="Auto-save" secondaryText="Automatically save your work every 5 minutes" />',
      '<ndwu-toggle aria-label="Dark mode" />',
    ]),
  }),
};

export const ExternalLabel: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      `<div>
  <label for="toggle-external-label-input">Dark mode</label>
  <ndwu-toggle id="toggle-external-label-input" aria-describedby="toggle-external-label-hint" />
</div>`,
      '<span id="toggle-external-label-hint">Switch between light and dark themes</span>',
    ]),
  }),
};

export const NativeForm: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Submit logs the form entries to Actions: `notifications` sends `enabled`; `auto-save` has no `value`, so it sends `on`.',
      },
    },
  },
  decorators: [...withNativeForm],
  argTypes: {submit: submitArgType},
  render: (args) => ({
    props: submitProps(args),
    template: nativeFormTemplate([
      '<ndwu-toggle name="notifications" value="enabled" label="Enable notifications" />',
      '<ndwu-toggle name="auto-save" label="Auto-save" />',
    ]),
  }),
};
