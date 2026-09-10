import {type Meta, type StoryObj, moduleMetadata} from '@storybook/angular';
import {expect, userEvent, within} from 'storybook/test';
import {SIZE, type Size} from '@ndw-ui-kit/core';
import {InputFieldStoryComponent} from './input-field-story.component';

interface InputFieldArgs {
  label: string;
  placeholder: string;
  hint: string;
  size: Size;
  required: boolean;
  readonly: boolean;
  type: 'text' | 'password';
  // Story-host-only controls, not `NdwuInputFieldComponent` inputs: they
  // seed/drive the host's own `FormControl` (see `InputFieldStoryComponent`).
  initialValue: string;
  disabled: boolean;
  showValidation: boolean;
}

const meta: Meta<InputFieldArgs> = {
  title: 'Form Field/Input Field',
  component: InputFieldStoryComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({imports: [InputFieldStoryComponent]})],
  args: {
    label: 'Name',
    placeholder: '',
    hint: '',
    size: SIZE.XL,
    required: false,
    readonly: false,
    type: 'text',
    initialValue: '',
    disabled: false,
    showValidation: false,
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Floating label text.',
      table: {defaultValue: {summary: 'Name'}},
    },
    placeholder: {
      control: 'text',
      description: 'Native input placeholder.',
    },
    hint: {
      control: 'text',
      description: 'Helper message shown below the input while there is no error.',
    },
    size: {
      control: 'select',
      options: Object.values(SIZE),
      description: 'Field size, applied via `NdwuSizeDirective`.',
      table: {defaultValue: {summary: SIZE.XL}},
    },
    required: {
      control: 'boolean',
      description: [
        'Marks the field as required. Also enables the story\'s',
        '`requiredWithLabel` validator on the underlying `FormControl`.',
      ].join(' '),
    },
    readonly: {
      control: 'boolean',
      description: 'Native readonly state.',
    },
    type: {
      control: 'select',
      options: ['text', 'password'],
      description: 'Native input type.',
    },
    initialValue: {
      control: 'text',
      description: [
        'Story-host control (not a `NdwuInputFieldComponent`',
        'input): seeds the host\'s own `FormControl` value. Only applied',
        'when this arg itself changes, so it never overwrites text you\'ve',
        'typed into the control.',
      ].join(' '),
    },
    disabled: {
      control: 'boolean',
      description: [
        'Story-host control (not a `NdwuInputFieldComponent`',
        'input): calls `FormControl.disable()`/`enable()`.',
      ].join(' '),
    },
    showValidation: {
      control: 'boolean',
      description: [
        'Story-host control (not a `NdwuInputFieldComponent`',
        'input): marks the `FormControl` touched (or untouched) so the',
        'library\'s built-in error display reacts to validity.',
      ].join(' '),
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <app-input-field-story
        [label]="label"
        [placeholder]="placeholder"
        [hint]="hint"
        [size]="size"
        [required]="required"
        [readonly]="readonly"
        [type]="type"
        [initialValue]="initialValue"
        [disabled]="disabled"
        [showValidation]="showValidation"
      />
    `,
  }),
};

export default meta;

type Story = StoryObj<InputFieldArgs>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.type(input, 'Ada');
    await expect(canvas.getByTestId('form-value')).toHaveTextContent('Ada');
  },
};

export const WithHint: Story = {args: {hint: 'Use your full name'}};

export const Disabled: Story = {
  args: {initialValue: 'Ada Lovelace', disabled: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toBeDisabled();
    await userEvent.type(input, ' Lastname', {skipClick: true});
    await expect(canvas.getByTestId('form-value')).toHaveTextContent('Ada Lovelace');
  },
};

export const Readonly: Story = {
  args: {initialValue: 'Ada Lovelace', readonly: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toHaveAttribute('readonly');
    await userEvent.type(input, ' Lastname');
    await expect(canvas.getByTestId('form-value')).toHaveTextContent('Ada Lovelace');
  },
};

export const ValidationError: Story = {
  args: {required: true, showValidation: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('This field is required')).toBeVisible();

    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'Ada');
    await expect(canvas.queryByText('This field is required')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('form-value')).toHaveTextContent('Ada');
  },
};

export const Password: Story = {
  args: {label: 'Password', type: 'password', initialValue: 'example-secret'},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>('input');

    if (!input) {
      throw new Error('Expected a native <input> element in the canvas.');
    }

    await expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(canvas.getByRole('button', {name: 'Show password'}));
    await expect(input).toHaveAttribute('type', 'text');

    await userEvent.click(canvas.getByRole('button', {name: 'Hide password'}));
    await expect(input).toHaveAttribute('type', 'password');
  },
};
