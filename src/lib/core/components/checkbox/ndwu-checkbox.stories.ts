import {computed, signal} from '@angular/core';
import {NDWU_SIZE, NdwuCheckboxComponent} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {outputArgType, sizeArgType} from '@sb/helpers/arg-types';
import {AriaArgs, SizeArg} from '@sb/helpers/story-args';
import {controlledProps} from '@sb/helpers/story-controlled';
import {SubmitArg, submitArgType, submitProps, withNativeForm} from '@sb/helpers/story-form';
import {withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type CheckboxStoryArgs = NdwuCheckboxComponent & SizeArg & AriaArgs & SubmitArg;

type Story = StoryObj<CheckboxStoryArgs>;

interface CheckboxState {
  label: string;
  bindings: string;
}

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const CHILDREN = [1, 2, 3];

const ENABLED_STATES: readonly CheckboxState[] = [
  {label: 'Unchecked', bindings: ''},
  {label: 'Checked', bindings: '[checked]="true"'},
  {label: 'Indeterminate', bindings: '[indeterminate]="true"'},
  {label: 'Invalid', bindings: '[invalid]="true"'},
];

const DISABLED_STATES: readonly CheckboxState[] = [
  {label: 'Disabled', bindings: '[disabled]="true"'},
  {label: 'Disabled checked', bindings: '[checked]="true" [disabled]="true"'},
];

const checkbox = ({label, bindings}: CheckboxState): string => {
  return `<ndwu-checkbox ${[`label="${label}"`, bindings].filter(Boolean).join(' ')} />`;
};

const group = (items: readonly string[]): string => {
  return `<div>\n${lines(items)}\n</div>`;
};

const meta: Meta<CheckboxStoryArgs> = {
  title: 'Core/Checkbox',
  component: NdwuCheckboxComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Checkbox with an optional label and secondary text; controlled through `checked` and `checkedChange`.',
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
    'indeterminate': {
      description: 'Shows the mixed state; a click clears it on the native input',
    },
    'disabled': {
      description: 'Disables the checkbox',
    },
    'invalid': {
      description: 'Shows the error style',
    },
    'required': {
      description: 'Sets `required` on the native input for form validation',
    },
    'id': {
      control: 'text',
      description: 'Id of the native input; a generated id is used when empty',
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
      description: 'Id of the element that labels the checkbox',
    },
    'aria-describedby': {
      control: 'text',
      description: 'Id of the element that describes the checkbox',
    },
    'inputTabIndex': {
      control: 'number',
      description: '`tabindex` of the native input',
    },
    'label': {
      control: 'text',
      description: 'Label text, passed through the `localize` pipe',
    },
    'secondaryText': {
      control: 'text',
      description: 'Text under the label, passed through the `localize` pipe',
    },
    'size': sizeArgType(SIZES),
    'checkedChange': outputArgType('checkedChange', 'Emits the new checked state on user change'),
    'focused': outputArgType('focused', 'Emits when the native input gets focus'),
    'blurred': outputArgType('blurred', 'Emits when the native input loses focus'),
  },
  args: {
    'checked': false,
    'indeterminate': false,
    'disabled': false,
    'invalid': false,
    'required': false,
    'id': '',
    'name': null,
    'value': null,
    'aria-label': null,
    'aria-labelledby': null,
    'aria-describedby': null,
    'inputTabIndex': null,
    'label': 'Accept terms and conditions',
    'secondaryText': 'By checking this box, you agree to our terms of service',
    'size': undefined,
  },
  render: (args) => ({
    props: controlledProps(args, 'checkedChange', (checked) => ({checked, indeterminate: false})),
    template: `<ndwu-checkbox ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      SIZES.map((size) => `<ndwu-checkbox size="${size}" label="Size ${size}" secondaryText="Additional text" />`),
    ),
  }),
};

export const States: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      group(ENABLED_STATES.map(checkbox)),
      group(DISABLED_STATES.map(checkbox)),
    ]),
  }),
};

export const Indeterminate: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => {
    const child1 = signal(false);
    const child2 = signal(true);
    const child3 = signal(false);
    const children = [child1, child2, child3];
    const checkedCount = computed(() => children.filter((child) => child()).length);

    return {
      props: {
        child1,
        child2,
        child3,
        allChecked: computed(() => checkedCount() === children.length),
        someChecked: computed(() => checkedCount() > 0 && checkedCount() < children.length),
        toggleAll: (checked: boolean) => children.forEach((child) => child.set(checked)),
      },
      template: lines([
        `<ndwu-checkbox
  label="Parent task"
  [checked]="allChecked()"
  [indeterminate]="someChecked()"
  (checkedChange)="toggleAll($event)"
/>`,
        group(
          CHILDREN.map((n) =>
            `<ndwu-checkbox label="Child task ${n}" [checked]="child${n}()" (checkedChange)="child${n}.set($event)" />`
          ),
        ),
      ]),
    };
  },
};

export const WithoutLabel: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      '<ndwu-checkbox aria-label="Remember me" aria-describedby="checkbox-without-label-hint" />',
      '<span id="checkbox-without-label-hint">No visible label: the accessible name comes from aria-label</span>',
    ]),
  }),
};

export const NativeForm: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: withNativeForm,
  argTypes: {submit: submitArgType},
  render: (args) => ({
    props: submitProps(args),
    template: `<form (submit)="submit($event)">
${
      lines([
        `<ndwu-checkbox
  name="terms"
  value="accepted"
  required
  label="Accept terms and conditions"
  secondaryText="name=&quot;terms&quot;, value=&quot;accepted&quot;, required"
/>`,
        `<ndwu-checkbox
  name="newsletter"
  label="Newsletter subscription"
  secondaryText="name=&quot;newsletter&quot; without value: sends &quot;on&quot;"
/>`,
        '<button ndwu-button type="submit" label="Submit"></button>',
      ])
    }
</form>`,
  }),
};
