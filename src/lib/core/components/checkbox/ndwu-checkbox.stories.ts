import {computed, signal} from '@angular/core';
import {NDWU_SIZE, NdwuCheckboxComponent} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {outputArgType, sizeArgType} from '@sb/helpers/arg-types';
import {AriaArgs, SizeArg} from '@sb/helpers/story-args';
import {CONTROLLED_STORY_PARAMETERS, withControlledArgs} from '@sb/helpers/story-controlled';
import {SubmitArg, nativeFormTemplate, submitArgType, submitProps, withNativeForm} from '@sb/helpers/story-form';
import {withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type CheckboxStoryArgs = NdwuCheckboxComponent & SizeArg & AriaArgs & SubmitArg;

type Story = StoryObj<CheckboxStoryArgs>;

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

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
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-checkbox ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {
  parameters: CONTROLLED_STORY_PARAMETERS,
  decorators: [withControlledArgs('checkedChange', (checked) => ({checked, indeterminate: false}))],
};

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
      group([
        '<ndwu-checkbox label="Unchecked" />',
        '<ndwu-checkbox label="Checked" [checked]="true" />',
        '<ndwu-checkbox label="Indeterminate" [indeterminate]="true" />',
        '<ndwu-checkbox label="Invalid" [invalid]="true" />',
      ]),
      group([
        '<ndwu-checkbox label="Disabled" [disabled]="true" />',
        '<ndwu-checkbox label="Disabled checked" [checked]="true" [disabled]="true" />',
      ]),
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
        group([
          '<ndwu-checkbox label="Child task 1" [checked]="child1()" (checkedChange)="child1.set($event)" />',
          '<ndwu-checkbox label="Child task 2" [checked]="child2()" (checkedChange)="child2.set($event)" />',
          '<ndwu-checkbox label="Child task 3" [checked]="child3()" (checkedChange)="child3.set($event)" />',
        ]),
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
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Submit logs the form entries to Actions: `terms` is `required` and sends `accepted`; `newsletter` has no `value`, so it sends `on`.',
      },
    },
  },
  decorators: [...withNativeForm],
  argTypes: {submit: submitArgType},
  render: (args) => ({
    props: submitProps(args),
    template: nativeFormTemplate([
      '<ndwu-checkbox name="terms" value="accepted" required label="Accept terms and conditions" />',
      '<ndwu-checkbox name="newsletter" label="Newsletter subscription" />',
    ]),
  }),
};
