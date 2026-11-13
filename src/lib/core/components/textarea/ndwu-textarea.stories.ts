import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuIconButtonComponent,
  NdwuTextareaActionsDirective,
  NdwuTextareaComponent,
  type NdwuTextareaResizeDirection,
} from '@ndw-ui-kit/core';
import {NdwuHelperMessageComponent} from '@ndw-ui-kit/core/form-field';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, outputArgType, sizeArgType, textArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {withControlledArgs} from '@sb/helpers/story-controlled';
import {withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type TextareaStoryArgs = NdwuTextareaComponent & SizeArg;

type Story = StoryObj<TextareaStoryArgs>;

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const RESIZE_DIRECTIONS: readonly NdwuTextareaResizeDirection[] = ['vertical', 'horizontal', 'both'];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const SAMPLE_TEXT = 'This is a textarea';

const SAMPLE_CONFIG = [
  'server:',
  '  host: example.com',
  '  port: 8080',
  '  timeout: 30',
  '',
  'logging:',
  '  level: info',
  '  file: logs/app.log',
].join('\n');

const meta: Meta<TextareaStoryArgs> = {
  title: 'Core/Textarea',
  component: NdwuTextareaComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Multi-line text control with line numbers, an actions slot, a loading state and resize; controlled through `value` and `valueChange`. For a label and hint put it in `ndwu-form-field`, or use `ndwu-textarea-field` with a reactive form.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    value: textArgType('Text value; update it from `valueChange`'),
    id: textArgType('Id of the native textarea; a generated id is used when empty'),
    placeholder: textArgType('Placeholder, passed through the `localize` pipe'),
    ariaLabel: textArgType('Accessible name when there is no visible label, passed through the `localize` pipe'),
    ariaDescribedby: textArgType('Id of the element that describes the textarea'),
    required: booleanArgType('Sets `aria-required` on the native textarea'),
    disabled: booleanArgType('Disables the textarea'),
    readonly: booleanArgType('Makes the textarea read-only'),
    invalid: booleanArgType('Shows the error style and sets `aria-invalid`'),
    loading: booleanArgType('Shows a spinner over the text and disables input'),
    loadingLabel: textArgType('Text next to the spinner, passed through the `localize` pipe'),
    resizable: booleanArgType('Shows the resize handle'),
    resizeDirection: {
      control: 'select',
      options: RESIZE_DIRECTIONS,
      description: 'Directions the resize handle drags in',
    },
    showLineNumbers: booleanArgType('Shows a line-number gutter and turns off soft wrap'),
    size: sizeArgType(SIZES),
    valueChange: outputArgType('valueChange', 'Emits the new text on user input'),
    blurred: outputArgType('blurred', 'Emits when the textarea loses focus'),
  },
  args: {
    value: SAMPLE_TEXT,
    id: '',
    placeholder: 'Enter text',
    ariaLabel: 'Comment',
    ariaDescribedby: null,
    required: false,
    disabled: false,
    readonly: false,
    invalid: false,
    loading: false,
    loadingLabel: '',
    resizable: true,
    resizeDirection: 'both',
    showLineNumbers: false,
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-textarea ${argsToTemplate(args)} />`,
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
      SIZES.map((size) => `<ndwu-textarea size="${size}" ariaLabel="Size ${size}" value="${SAMPLE_TEXT}" />`),
    ),
  }),
};

export const States: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      `<ndwu-textarea ariaLabel="Invalid" value="${SAMPLE_TEXT}" [invalid]="true" />`,
      `<ndwu-textarea ariaLabel="Disabled" value="${SAMPLE_TEXT}" [disabled]="true" />`,
      `<ndwu-textarea ariaLabel="Readonly" value="${SAMPLE_TEXT}" [readonly]="true" />`,
      '<ndwu-textarea ariaLabel="Loading" [loading]="true" loadingLabel="Loading" />',
    ]),
  }),
};

export const LineNumbers: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  render: () => ({
    template: `<ndwu-textarea ariaLabel="Configuration" [showLineNumbers]="true" value="${SAMPLE_CONFIG}" />`,
  }),
};

export const Actions: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Buttons in `[ndwuTextareaActions]` sit in the top-right corner, and the text flows around them. Their click handlers are app code.',
      },
    },
  },
  decorators: [moduleMetadata({imports: [NdwuTextareaActionsDirective, NdwuIconButtonComponent]})],
  render: () => ({
    template: `<ndwu-textarea ariaLabel="Configuration" [showLineNumbers]="true" value="${SAMPLE_CONFIG}">
  <div ndwuTextareaActions>
    <button ndwuIconButton variant="flat" icon="${NDWU_ICON_NAME.REFORMAT_S}" aria-label="Reformat"></button>
    <button ndwuIconButton variant="flat" icon="${NDWU_ICON_NAME.COPY_S}" aria-label="Copy"></button>
    <button ndwuIconButton variant="flat" icon="${NDWU_ICON_NAME.CLOSE_S}" aria-label="Clear"></button>
  </div>
</ndwu-textarea>`,
  }),
};

export const Resize: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      ...RESIZE_DIRECTIONS.map((direction) =>
        `<ndwu-textarea ariaLabel="Resize ${direction}" resizeDirection="${direction}" value="${SAMPLE_TEXT}" />`
      ),
      `<ndwu-textarea ariaLabel="Not resizable" [resizable]="false" value="${SAMPLE_TEXT}" />`,
    ]),
  }),
};

export const InFormField: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          '`ndwu-form-field` adds a floating label and a hint around the textarea. In a reactive form use `ndwu-textarea-field`.',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [NdwuFormFieldComponent, NdwuFloatingLabelComponent, NdwuHintDirective, NdwuHelperMessageComponent],
    }),
  ],
  render: () => ({
    template: `<ndwu-form-field>
  <ndwu-floating-label label="Comment" />
  <ndwu-textarea placeholder="Enter text" />
  <ndwu-helper-message ndwuHint helperMessage="Visible to the support team only" />
</ndwu-form-field>`,
  }),
};
