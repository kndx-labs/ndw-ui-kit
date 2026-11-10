import {NDWU_SIZE, type NdwuPasswordStrength, type NdwuPasswordStrengthHintTexts} from '@ndw-ui-kit/core';
import {NdwuPasswordInputFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, sizeArgType, textArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {
  FORM_CONTROL_ARGS,
  FormControlArgs,
  formControlArgTypes,
  formControlArgs,
  storyFormControl,
  withFormControl,
} from '@sb/helpers/story-form-control';
import {withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type PasswordInputFieldStoryArgs = NdwuPasswordInputFieldComponent & SizeArg & FormControlArgs;

type Story = StoryObj<PasswordInputFieldStoryArgs>;

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const STRENGTHS: readonly NdwuPasswordStrength[] = ['weak', 'average', 'strong'];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const SAMPLE_PASSWORD = 'MyStr0ngP@ss2024';
const REQUIRED_PASSWORD = NdwuValidators.required('Enter a password');

const STRENGTH_VALUES: Record<NdwuPasswordStrength, string> = {
  weak: 'abc',
  average: 'abcdef',
  strong: 'abcdefghij',
};

const HINT_TEXTS: NdwuPasswordStrengthHintTexts = {
  default: 'Use at least 8 characters',
  weak: 'Weak password',
  average: 'Average password',
  strong: 'Strong password',
};

const HINT_TEXTS_BINDING =
  '{default: \'Use at least 8 characters\', weak: \'Weak password\', average: \'Average password\', strong: \'Strong password\'}';

const EYE_LABELS = 'showPasswordIconLabel="Show password" hidePasswordIconLabel="Hide password"';

const strengthOf = (password: string): NdwuPasswordStrength | null => {
  if (!password) {
    return null;
  }

  if (password.length <= 4) {
    return 'weak';
  }

  if (password.length <= 8) {
    return 'average';
  }

  return 'strong';
};

const meta: Meta<PasswordInputFieldStoryArgs> = {
  title: 'Form Field/Password Input Field',
  component: NdwuPasswordInputFieldComponent,
  tags: ['autodocs'],
  decorators: [withFormControl],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Password input with a show/hide button, a strength indicator and strength hints, for reactive forms. The app computes `strength`; `weak` shows the error style. Bind it with `formControl` or `formControlName`; the control sets the disabled state.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    label: textArgType('Floating label text, passed through the `localize` pipe'),
    placeholder: textArgType('Placeholder, passed through the `localize` pipe'),
    hint: textArgType('Helper text under the field; replaces the strength hint, and a validation error replaces it'),
    ndwuRequired: booleanArgType(
      'Shows the required mark on the label; add a required validator to the control for validation',
    ),
    strength: {
      control: {
        type: 'select',
        labels: {null: 'none'},
      },
      options: [null, ...STRENGTHS],
      description: 'Strength shown by the indicator; the app computes it from the value',
    },
    strengthHintTexts: {
      control: 'object',
      description:
        'Hint per strength (`default` when `strength` is `null`); shown when `hint` is empty and the control is valid',
    },
    showPasswordIconLabel: textArgType('`aria-label` of the show-password button, passed through the `localize` pipe'),
    hidePasswordIconLabel: textArgType('`aria-label` of the hide-password button, passed through the `localize` pipe'),
    size: sizeArgType(SIZES),
    ...formControlArgTypes,
  },
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    hint: '',
    ndwuRequired: true,
    strength: 'strong',
    strengthHintTexts: HINT_TEXTS,
    showPasswordIconLabel: 'Show password',
    hidePasswordIconLabel: 'Hide password',
    ...formControlArgs,
  },
  render: (args, {id}) => ({
    props: {
      ...args,
      control: storyFormControl(id, {
        value: SAMPLE_PASSWORD,
        validators: [REQUIRED_PASSWORD],
        disabled: args.disabled,
        touched: args.touched,
      }),
    },
    template: `<ndwu-password-input-field [formControl]="control" ${
      argsToTemplate(args, {exclude: FORM_CONTROL_ARGS})
    } />`,
  }),
};

export default meta;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The control is `new FormControl(\'MyStr0ngP@ss2024\', [NdwuValidators.required(\'Enter a password\')])`; clear the field to see the error.',
      },
    },
  },
};

export const Strength: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: (_args, {id}) => ({
    props: Object.fromEntries(
      STRENGTHS.map((strength) => [
        `${strength}Control`,
        storyFormControl(`${id}-${strength}`, {value: STRENGTH_VALUES[strength]}),
      ]),
    ),
    template: lines(
      STRENGTHS.map((strength) =>
        `<ndwu-password-input-field
  [formControl]="${strength}Control"
  label="Password"
  ${EYE_LABELS}
  strength="${strength}"
  [strengthHintTexts]="${HINT_TEXTS_BINDING}"
/>`
      ),
    ),
  }),
};

export const StrengthFromValue: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'The story computes `strength` from the length: up to 4 characters `weak`, up to 8 `average`, longer `strong`. The rule belongs to the app.',
      },
    },
  },
  render: (_args, {id}) => ({
    props: {control: storyFormControl(id, {value: ''}), strengthOf},
    template: `<ndwu-password-input-field
  [formControl]="control"
  label="Password"
  ${EYE_LABELS}
  [strength]="strengthOf(control.value)"
  [strengthHintTexts]="${HINT_TEXTS_BINDING}"
/>`,
  }),
};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: (_args, {id}) => ({
    props: Object.fromEntries(
      SIZES.map((size) => [
        `${size.toLowerCase()}Control`,
        storyFormControl(`${id}-${size}`, {value: SAMPLE_PASSWORD}),
      ]),
    ),
    template: lines(
      SIZES.map((size) =>
        `<ndwu-password-input-field [formControl]="${size.toLowerCase()}Control" size="${size}" label="Size ${size}" ${EYE_LABELS} />`
      ),
    ),
  }),
};

export const States: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Empty, required and touched, so the error replaces the hint; disabled through the control (`control.disable()`).',
      },
    },
  },
  decorators: [withStackLayout],
  render: (_args, {id}) => ({
    props: {
      errorControl: storyFormControl(`${id}-error`, {
        value: '',
        validators: [REQUIRED_PASSWORD],
        touched: true,
      }),
      disabledControl: storyFormControl(`${id}-disabled`, {value: SAMPLE_PASSWORD, disabled: true}),
    },
    template: lines([
      `<ndwu-password-input-field [formControl]="errorControl" label="Password" ${EYE_LABELS} ndwuRequired />`,
      `<ndwu-password-input-field [formControl]="disabledControl" label="Disabled" ${EYE_LABELS} />`,
    ]),
  }),
};
