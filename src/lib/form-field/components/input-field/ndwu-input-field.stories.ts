import {signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_ICON_NAMES,
  NDWU_SIZE,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuIconComponent,
  NdwuInputDirective,
  NdwuSuffixDirective,
} from '@ndw-ui-kit/core';
import {NdwuHelperMessageComponent, NdwuInputFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, outputArgType, sizeArgType, textArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {SubmitArg, nativeFormTemplate, submitArgType, submitProps, withNativeForm} from '@sb/helpers/story-form';
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

type InputFieldStoryArgs = NdwuInputFieldComponent & SizeArg & FormControlArgs & SubmitArg;

type Story = StoryObj<InputFieldStoryArgs>;

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const TYPES = ['text', 'password'];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const REQUIRED_EMAIL = NdwuValidators.required('Enter your email');
const VALID_EMAIL = NdwuValidators.email('Enter a valid email');

const meta: Meta<InputFieldStoryArgs> = {
  title: 'Form Field/Input Field',
  component: NdwuInputFieldComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Text or password input with a floating label, a hint, a validation error and an optional right icon button, for reactive forms. Bind it with `formControl` or `formControlName`; the control sets the disabled state. Its parts, `ndwu-form-field` and `input[ndwuInput]`, can be used directly (see `Compound`).',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    label: textArgType('Floating label text, passed through the `localize` pipe'),
    placeholder: textArgType('Placeholder, passed through the `localize` pipe'),
    hint: textArgType('Helper text under the field; a validation error replaces it'),
    ndwuRequired: booleanArgType(
      'Shows the required mark on the label; add a required validator to the control for validation',
    ),
    type: {
      control: 'select',
      options: TYPES,
      description: '`password` masks the value and adds a show/hide button',
    },
    readonly: booleanArgType('Makes the input read-only'),
    rightIcon: {
      control: {
        type: 'select',
        labels: {undefined: 'none'},
      },
      options: [undefined, ...NDWU_ICON_NAMES],
      description: 'Icon button at the end of the field; ignored when `type` is `password`',
    },
    showPasswordIconLabel: textArgType('`aria-label` of the show-password button, passed through the `localize` pipe'),
    hidePasswordIconLabel: textArgType('`aria-label` of the hide-password button, passed through the `localize` pipe'),
    size: sizeArgType(SIZES),
    rightIconClicked: outputArgType('rightIconClicked', 'Emits the click event of the right icon button'),
    ...formControlArgTypes,
  },
  args: {
    label: 'Email',
    placeholder: 'name@example.com',
    hint: 'Used for sign-in',
    ndwuRequired: true,
    type: 'text',
    readonly: false,
    showPasswordIconLabel: 'Show password',
    hidePasswordIconLabel: 'Hide password',
    ...formControlArgs,
  },
  render: (args, {id}) => ({
    props: {
      ...args,
      control: storyFormControl(id, {
        value: '',
        validators: [REQUIRED_EMAIL, VALID_EMAIL],
        disabled: args.disabled,
        touched: args.touched,
      }),
    },
    template: `<ndwu-input-field [formControl]="control" ${argsToTemplate(args, {exclude: FORM_CONTROL_ARGS})} />`,
  }),
};

export default meta;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The control is `new FormControl(\'\', [NdwuValidators.required(\'Enter your email\'), NdwuValidators.email(\'Enter a valid email\')])`.',
      },
    },
  },
  decorators: [withFormControl],
};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withFormControl, withStackLayout],
  render: (_args, {id}) => ({
    props: Object.fromEntries(
      SIZES.map((size) => [`${size.toLowerCase()}Control`, storyFormControl(`${id}-${size}`, {value: ''})]),
    ),
    template: lines(
      SIZES.map((size) =>
        `<ndwu-input-field [formControl]="${size.toLowerCase()}Control" size="${size}" label="Size ${size}" placeholder="Enter text" />`
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
          'With a value; read-only; disabled through the control (`control.disable()`); empty, required and touched, so the error replaces the hint.',
      },
    },
  },
  decorators: [withFormControl, withStackLayout],
  render: (_args, {id}) => ({
    props: {
      filledControl: storyFormControl(`${id}-filled`, {value: 'Sample text'}),
      readonlyControl: storyFormControl(`${id}-readonly`, {value: 'Sample text'}),
      disabledControl: storyFormControl(`${id}-disabled`, {value: 'Sample text', disabled: true}),
      errorControl: storyFormControl(`${id}-error`, {value: '', validators: [REQUIRED_EMAIL], touched: true}),
    },
    template: lines([
      '<ndwu-input-field [formControl]="filledControl" label="With value" />',
      '<ndwu-input-field [formControl]="readonlyControl" label="Read-only" hint="The value can be selected and copied" [readonly]="true" />',
      '<ndwu-input-field [formControl]="disabledControl" label="Disabled" />',
      '<ndwu-input-field [formControl]="errorControl" label="Email" hint="Used for sign-in" ndwuRequired />',
    ]),
  }),
};

export const Password: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withFormControl],
  render: (_args, {id}) => ({
    props: {control: storyFormControl(id, {value: 'MyStr0ngP@ss2024'})},
    template: `<ndwu-input-field
  [formControl]="control"
  type="password"
  label="Password"
  showPasswordIconLabel="Show password"
  hidePasswordIconLabel="Hide password"
/>`,
  }),
};

export const RightIcon: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    a11y: {config: {rules: [{id: 'button-name', enabled: false}]}},
    docs: {
      description: {
        story:
          'Listen to `rightIconClicked` for the button: the second field clears its value on click. A `password` field ignores `rightIcon`.',
      },
    },
  },
  decorators: [withFormControl, withStackLayout],
  render: (_args, {id}) => ({
    props: {
      searchControl: storyFormControl(`${id}-search`, {value: ''}),
      clearControl: storyFormControl(`${id}-clear`, {value: 'Sample text'}),
    },
    template: lines([
      `<ndwu-input-field [formControl]="searchControl" label="Search" placeholder="Enter a query" rightIcon="${NDWU_ICON_NAME.SEARCH_L}" />`,
      `<ndwu-input-field [formControl]="clearControl" label="Clearable" placeholder="Enter text" rightIcon="${NDWU_ICON_NAME.CLOSE_L}" (rightIconClicked)="clearControl.setValue('')" />`,
    ]),
  }),
};

export const Compound: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'The parts of `ndwu-input-field`: `ndwu-form-field` with a floating label, `input[ndwuInput]`, a suffix and a hint. `ndwuInput` reads the error and disabled state from the control.',
      },
    },
  },
  decorators: [
    withFormControl,
    moduleMetadata({
      imports: [
        NdwuFormFieldComponent,
        NdwuFloatingLabelComponent,
        NdwuInputDirective,
        NdwuIconComponent,
        NdwuSuffixDirective,
        NdwuHintDirective,
        NdwuHelperMessageComponent,
      ],
    }),
  ],
  render: (_args, {id}) => ({
    props: {control: storyFormControl(id, {value: ''})},
    template: `<ndwu-form-field>
  <ndwu-floating-label label="Search" />
  <input ndwuInput [formControl]="control" placeholder="Enter a query" />
  <ndwu-icon name="${NDWU_ICON_NAME.SEARCH_L}" ndwuSuffix />
  <ndwu-helper-message ndwuHint helperMessage="Searches devices by name" />
</ndwu-form-field>`,
  }),
};

export const NativeForm: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Without Angular forms `ndwuInput` follows native validity: the `required` error shows after input or blur and clears on reset. Submit logs the form entries to Actions.',
      },
    },
  },
  decorators: [
    ...withNativeForm,
    moduleMetadata({imports: [NdwuFormFieldComponent, NdwuFloatingLabelComponent, NdwuInputDirective]}),
  ],
  argTypes: {submit: submitArgType},
  render: (args) => ({
    props: submitProps(args),
    template: nativeFormTemplate([
      `<ndwu-form-field>
  <ndwu-floating-label label="Name" [required]="true" />
  <input ndwuInput name="name" required />
</ndwu-form-field>`,
      '<button ndwu-button type="reset" variant="secondary" label="Reset"></button>',
    ]),
  }),
};

export const AriaInvalid: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Without Angular forms, `aria-invalid="true"` on `input[ndwuInput]` shows the error style at once, before any input. Use it when the app validates the value itself.',
      },
    },
  },
  decorators: [moduleMetadata({imports: [NdwuFormFieldComponent, NdwuFloatingLabelComponent, NdwuInputDirective]})],
  render: () => ({
    template: `<ndwu-form-field>
  <ndwu-floating-label label="Invalid input" />
  <input ndwuInput aria-invalid="true" placeholder="Enter text" />
</ndwu-form-field>`,
  }),
};

export const AriaInvalidOverride: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Without Angular forms, `[aria-invalid]="false"` overrides native validity: the input is `required` but stays valid after input or blur. With a form control the control\'s state wins.',
      },
    },
  },
  decorators: [moduleMetadata({imports: [NdwuFormFieldComponent, NdwuFloatingLabelComponent, NdwuInputDirective]})],
  render: () => ({
    template: `<ndwu-form-field>
  <ndwu-floating-label label="Required field" />
  <input ndwuInput required [aria-invalid]="false" placeholder="Enter text" />
</ndwu-form-field>`,
  }),
};

export const NgModel: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'Template-driven forms work too: `ngModel` is the form control of the field.',
      },
    },
  },
  decorators: [moduleMetadata({imports: [FormsModule]})],
  render: () => ({
    props: {email: signal('')},
    template: lines([
      '<ndwu-input-field label="Email" placeholder="name@example.com" [ngModel]="email()" (ngModelChange)="email.set($event)" />',
      '<output>Value: "{{ email() }}"</output>',
    ]),
  }),
};

export const NoFormControl: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Without `formControl`, `formControlName` or `ngModel` the field renders, but nothing reads its value, validates it or disables it. Bind a form control in app code.',
      },
    },
  },
  render: () => ({
    template: '<ndwu-input-field label="Email" placeholder="name@example.com" hint="Used for sign-in" />',
  }),
};
