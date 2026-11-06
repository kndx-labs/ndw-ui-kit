import {NDWU_SIZE, NdwuRadioButtonComponent, NdwuRadioGroupComponent} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {outputArgType, sizeArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {CONTROLLED_STORY_PARAMETERS, withControlledArgs} from '@sb/helpers/story-controlled';
import {SubmitArg, nativeFormTemplate, submitArgType, submitProps, withNativeForm} from '@sb/helpers/story-form';
import {withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type RadioStoryArgs = NdwuRadioGroupComponent & SizeArg & SubmitArg;

type Story = StoryObj<RadioStoryArgs>;

interface RadioOption {
  value: string;
  label: string;
  secondaryText?: string;
}

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const DEFAULT_OPTIONS: readonly RadioOption[] = [
  {value: 'option1', label: 'Option 1'},
  {value: 'option2', label: 'Option 2'},
  {value: 'option3', label: 'Option 3', secondaryText: 'Additional text'},
];

const OPTION_VALUES = DEFAULT_OPTIONS.map(({value}) => value);

const radioButton = ({value, label, secondaryText}: RadioOption): string => {
  const text = secondaryText ? ` secondaryText="${secondaryText}"` : '';

  return `  <ndwu-radio-button value="${value}" label="${label}"${text} />`;
};

const meta: Meta<RadioStoryArgs> = {
  title: 'Core/Radio',
  component: NdwuRadioGroupComponent,
  subcomponents: {NdwuRadioButtonComponent},
  tags: ['autodocs'],
  decorators: [moduleMetadata({imports: [NdwuRadioButtonComponent]})],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Radio group with `ndwu-radio-button` options; the group holds the value (`value` / `valueChange`), name, size, `disabled` and `required`.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    value: {
      control: {
        type: 'select',
        labels: {'': 'none'},
      },
      options: ['', ...OPTION_VALUES],
      description: 'Value of the selected option; update it from `valueChange`',
    },
    name: {
      control: 'text',
      description: 'Native `name` of every radio; a generated name is used when empty',
    },
    disabled: {
      description: 'Disables every option',
    },
    required: {
      description: 'Sets `required` on every native radio for form validation',
    },
    size: sizeArgType(SIZES),
    valueChange: outputArgType('valueChange', 'Emits the value of the option the user selects'),
    blurred: outputArgType('blurred', 'Emits when focus leaves the group'),
  },
  args: {
    value: '',
    name: '',
    disabled: false,
    required: false,
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-radio-group ${argsToTemplate(args)}>\n${
      lines(DEFAULT_OPTIONS.map(radioButton))
    }\n</ndwu-radio-group>`,
  }),
};

export default meta;

export const Default: Story = {
  parameters: CONTROLLED_STORY_PARAMETERS,
  decorators: [withControlledArgs('valueChange', (value) => ({value}))],
};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      SIZES.map((size) =>
        `<ndwu-radio-group size="${size}">
  <ndwu-radio-button value="option1" label="Size ${size} option 1" secondaryText="Additional text" />
  <ndwu-radio-button value="option2" label="Size ${size} option 2" secondaryText="Additional text" />
</ndwu-radio-group>`
      ),
    ),
  }),
};

export const States: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      `<ndwu-radio-group value="option2">
  <ndwu-radio-button value="option1" label="Option 1" />
  <ndwu-radio-button value="option2" label="Option 2, selected" />
</ndwu-radio-group>`,
      `<ndwu-radio-group [disabled]="true">
  <ndwu-radio-button value="option1" label="Disabled option 1" secondaryText="Additional text" />
  <ndwu-radio-button value="option2" label="Disabled option 2" secondaryText="Additional text" />
</ndwu-radio-group>`,
      `<ndwu-radio-group value="option2" [disabled]="true">
  <ndwu-radio-button value="option1" label="Disabled option 1" />
  <ndwu-radio-button value="option2" label="Disabled option 2, selected" />
</ndwu-radio-group>`,
      `<ndwu-radio-group>
  <ndwu-radio-button value="option1" label="Option 1" />
  <ndwu-radio-button value="option2" label="Disabled option 2" [disabled]="true" />
</ndwu-radio-group>`,
    ]),
  }),
};

export const NativeForm: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [...withNativeForm],
  argTypes: {submit: submitArgType},
  render: (args) => ({
    props: submitProps(args),
    template: nativeFormTemplate([
      `<ndwu-radio-group name="plan" required>
  <ndwu-radio-button value="basic" label="Basic" aria-describedby="radio-native-form-basic-hint" />
  <ndwu-radio-button value="pro" label="Pro" />
</ndwu-radio-group>`,
      '<span id="radio-native-form-basic-hint">The Basic option is described by this text through aria-describedby</span>',
    ]),
  }),
};
