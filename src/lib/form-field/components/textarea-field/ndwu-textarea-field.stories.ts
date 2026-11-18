import {NDWU_SIZE} from '@ndw-ui-kit/core';
import {NdwuTextareaFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, textArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {
  DEFAULT_FORM_CONTROL_ARGS,
  FORM_CONTROL_ARGS,
  FormControlArgs,
  formControlArgTypes,
  getStoryFormControl,
  setStoryFormControlState,
  withFormControl,
} from '@sb/helpers/story-form-control';

type TextareaFieldStoryArgs = NdwuTextareaFieldComponent & SizeArg & FormControlArgs;

type Story = StoryObj<TextareaFieldStoryArgs>;

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const REQUIRED = NdwuValidators.required('Enter a comment');
const WRAPPER_CONTROLS = {include: ['label', 'hint', 'ndwuRequired', 'disabled', 'touched']};

const meta: Meta<TextareaFieldStoryArgs> = {
  title: 'Form Field/Textarea Field',
  component: NdwuTextareaFieldComponent,
  tags: ['autodocs'],
  decorators: [withFormControl],
  parameters: {
    sizes: SIZES,
    controls: WRAPPER_CONTROLS,
    docs: {
      controls: WRAPPER_CONTROLS,
      description: {
        component: [
          '`ndwu-textarea` with a floating label, a hint and a validation error, for reactive forms.',
          'Bind it with `formControl` or `formControlName`;',
          'the control sets the value, the disabled state and the validity.',
          '`placeholder`, `ariaLabel`, `readonly`, `loading`, `loadingLabel`, `resizable`, `resizeDirection`',
          'and `showLineNumbers` work as in [Core/Textarea](?path=/docs/core-textarea--docs),',
          'and content marked `ndwuTextareaActions` goes to the textarea\'s actions slot.',
        ].join(' '),
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    label: textArgType('Floating label text, passed through the `localize` pipe'),
    hint: textArgType('Helper text under the field; a validation error replaces it'),
    ndwuRequired: booleanArgType(
      'Shows the required mark on the label and sets `aria-required`; add a required validator to the control for validation',
    ),
    ...formControlArgTypes,
  },
  args: {
    label: 'Comment',
    hint: 'Visible to the support team only',
    ndwuRequired: true,
    ...DEFAULT_FORM_CONTROL_ARGS,
  },
  render: (args, {id}) => {
    const control = getStoryFormControl(id, {value: '', validators: [REQUIRED]});

    setStoryFormControlState(control, args);

    return {
      props: {...args, control},
      template: `<ndwu-textarea-field [formControl]="control" ${argsToTemplate(args, {exclude: FORM_CONTROL_ARGS})} />`,
    };
  },
};

export default meta;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The control is `new FormControl(\'\', [NdwuValidators.required(\'Enter a comment\')])`.',
      },
    },
  },
};

export const ValidationError: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'The control is empty, required and touched, so the error replaces the hint. Typing a value clears it.',
      },
    },
  },
  render: () => {
    const control = getStoryFormControl('textarea-field-validation-error', {value: '', validators: [REQUIRED]});

    setStoryFormControlState(control, {touched: true});

    return {
      props: {control},
      template: `<ndwu-textarea-field
  [formControl]="control"
  label="Comment"
  hint="Visible to the support team only"
  ndwuRequired
/>`,
    };
  },
};

export const Disabled: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'Disable the field through the control: `control.disable()`. The field has no `disabled` input.',
      },
    },
  },
  render: () => {
    const control = getStoryFormControl('textarea-field-disabled', {value: 'This is a textarea'});

    setStoryFormControlState(control, {disabled: true});

    return {
      props: {control},
      template: '<ndwu-textarea-field [formControl]="control" label="Comment" />',
    };
  },
};
