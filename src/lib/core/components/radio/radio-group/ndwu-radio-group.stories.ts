import {NDWU_SIZE, NdwuRadioButtonComponent, NdwuRadioGroupComponent} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {outputArgType, sizeArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {withControlledArgs} from '@sb/helpers/story-controlled';
import {SubmitArg, nativeFormTemplate, submitArgType, submitProps, withNativeForm} from '@sb/helpers/story-form';
import {withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type RadioStoryArgs = NdwuRadioGroupComponent & SizeArg & SubmitArg;

type Story = StoryObj<RadioStoryArgs>;

interface RadioOption {
  value: string;
  label: string;
  attributes?: string;
}

interface RadioGroupExample {
  bindings: string;
  options: readonly RadioOption[];
}

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const SECONDARY_TEXT = 'secondaryText="Additional text"';

const DEFAULT_OPTIONS: readonly RadioOption[] = [
  {value: 'option1', label: 'Option 1'},
  {value: 'option2', label: 'Option 2'},
  {value: 'option3', label: 'Option 3', attributes: SECONDARY_TEXT},
];

const OPTION_VALUES = DEFAULT_OPTIONS.map(({value}) => value);

const STATE_EXAMPLES: readonly RadioGroupExample[] = [
  {
    bindings: 'value="option2"',
    options: [
      {value: 'option1', label: 'Option 1'},
      {value: 'option2', label: 'Option 2, selected'},
    ],
  },
  {
    bindings: '[disabled]="true"',
    options: [
      {value: 'option1', label: 'Disabled option 1'},
      {value: 'option2', label: 'Disabled option 2'},
    ],
  },
  {
    bindings: 'value="option2" [disabled]="true"',
    options: [
      {value: 'option1', label: 'Disabled option 1'},
      {value: 'option2', label: 'Disabled option 2, selected'},
    ],
  },
  {
    bindings: '',
    options: [
      {value: 'option1', label: 'Option 1'},
      {value: 'option2', label: 'Disabled option 2', attributes: '[disabled]="true"'},
    ],
  },
];

const optionsWithText = (prefix: string): readonly RadioOption[] => {
  return [1, 2].map((n) => ({value: `option${n}`, label: `${prefix} option ${n}`, attributes: SECONDARY_TEXT}));
};

const radioButton = ({value, label, attributes}: RadioOption): string => {
  return `  <ndwu-radio-button ${[`value="${value}"`, `label="${label}"`, attributes].filter(Boolean).join(' ')} />`;
};

const radioGroup = ({bindings, options}: RadioGroupExample): string => {
  const openTag = ['<ndwu-radio-group', bindings].filter(Boolean).join(' ');

  return `${openTag}>\n${lines(options.map(radioButton))}\n</ndwu-radio-group>`;
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
    size: undefined,
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
  decorators: [withControlledArgs('valueChange', (value) => ({value}))],
};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      SIZES.map((size) => radioGroup({bindings: `size="${size}"`, options: optionsWithText(`Size ${size}`)})),
    ),
  }),
};

export const States: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(STATE_EXAMPLES.map(radioGroup)),
  }),
};

export const WithSecondaryText: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  render: () => ({
    template: radioGroup({bindings: '', options: optionsWithText('Plan')}),
  }),
};

export const NativeForm: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [...withNativeForm],
  argTypes: {submit: submitArgType},
  render: (args) => ({
    props: submitProps(args),
    template: nativeFormTemplate([
      radioGroup({
        bindings: 'name="plan" required',
        options: [
          {value: 'basic', label: 'Basic', attributes: 'aria-describedby="radio-native-form-basic-hint"'},
          {value: 'pro', label: 'Pro'},
        ],
      }),
      '<span id="radio-native-form-basic-hint">The Basic option is described by this text through aria-describedby</span>',
    ]),
  }),
};
