import {NDWU_NOTIFICATION_VARIANT, NdwuNotificationComponent, NdwuNotificationVariant} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {textArgType} from '@sb/helpers/arg-types';
import {withNarrowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {dedent, lines} from '@sb/helpers/story-template';
import {withTranslations} from '@sb/helpers/story-translations';

type Story = StoryObj<NdwuNotificationComponent>;

interface VariantExample {
  variant: NdwuNotificationVariant;
  message: string;
}

interface HeaderVariantExample extends VariantExample {
  header: string;
}

const VARIANTS = Object.values(NDWU_NOTIFICATION_VARIANT);
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const VARIANT_EXAMPLES: readonly VariantExample[] = [
  {variant: NDWU_NOTIFICATION_VARIANT.INFO, message: 'Info notification'},
  {variant: NDWU_NOTIFICATION_VARIANT.SUCCESS, message: 'Success notification'},
  {variant: NDWU_NOTIFICATION_VARIANT.WARNING, message: 'Warning notification'},
  {variant: NDWU_NOTIFICATION_VARIANT.ERROR, message: 'Error notification'},
];

const HEADER_VARIANT_EXAMPLES: readonly HeaderVariantExample[] = [
  {variant: NDWU_NOTIFICATION_VARIANT.INFO, header: 'Info header', message: 'Info notification'},
  {variant: NDWU_NOTIFICATION_VARIANT.SUCCESS, header: 'Success header', message: 'Success notification'},
  {variant: NDWU_NOTIFICATION_VARIANT.WARNING, header: 'Warning header', message: 'Warning notification'},
  {variant: NDWU_NOTIFICATION_VARIANT.ERROR, header: 'Error header', message: 'Error notification'},
];

const LONG_TEXT = [
  'This is a very long notification message that contains important information and should wrap',
  'to multiple lines when placed in a narrow container with a fixed width of 200 pixels.',
  'It demonstrates how the text wraps correctly within the component boundaries.',
].join(' ');
const HTML_TEXT = 'This notification contains <b>bold text</b> and <em>inline HTML</em>.';
const LED_HINT_KEY = 'setup.led-hint';
const LED_HINT_HTML = [
  'Wait until the <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%;',
  'background: #4caf50; position: relative; top: 1px;"></span>',
  'LED is lit and not blinking, then continue the setup.',
].join(' ');

const meta: Meta<NdwuNotificationComponent> = {
  title: 'Core/Notification',
  component: NdwuNotificationComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        // @dprint-ignore
        component: 'Inline message with a variant icon and background; optional `header` and `message` accept text, HTML or a translation key.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: VARIANTS,
      description: 'Background colour and icon',
    },
    message: textArgType(
      [
        'Text, HTML or a translation key, passed through `localizeHtml`.',
        'A plain string is sanitized: safe tags stay, `style` attributes and scripts are removed.',
        'A key resolved by the app\'s `NdwuTranslationService`, or a `SafeHtml` value, is trusted',
      ].join(' '),
    ),
    header: textArgType('Text, HTML or a translation key through `localizeHtml`; not rendered when empty.'),
  },
  args: {
    variant: NDWU_NOTIFICATION_VARIANT.INFO,
    header: '',
    message: 'This is a notification message',
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-notification ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {};

export const Variants: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      VARIANT_EXAMPLES.map(({variant, message}) => {
        return dedent(
          `<ndwu-notification
                  variant="${variant}"
                  message="${message}"
                />`,
        );
      }),
    ),
  }),
};

export const WithHeader: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      HEADER_VARIANT_EXAMPLES.map(({variant, header, message}) => {
        return dedent(
          `<ndwu-notification
                      variant="${variant}"
                      header="${header}"
                      message="${message}"
                    />`,
        );
      }),
    ),
  }),
};

export const LongText: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        // @dprint-ignore
        story: 'The header and long message wrap while the icon stays aligned at the top. The 200 px box comes from the story layout.',
      },
    },
  },
  decorators: [withNarrowLayout],
  render: () => ({
    template: dedent(
      `<ndwu-notification
                header="Important information"
                message="${LONG_TEXT}"
              />`,
    ),
  }),
};

export const HtmlMessage: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: [
          'A string that is not a translation key is inserted as HTML through Angular\'s sanitizer:',
          'tags such as `<b>`, `<em>` and links stay, `style` attributes and scripts are removed.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<ndwu-notification message="${HTML_TEXT}" />`,
  }),
};

export const StyledHtmlMessage: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: [
          [
            `\`message\` is the translation key \`${LED_HINT_KEY}\`.`,
            'The app\'s `NdwuTranslationService` resolves it to:',
          ].join(' '),
          '',
          '```html',
          LED_HINT_HTML,
          '```',
          '',
          [
            '`localizeHtml` trusts translated HTML, so the inline `style` stays.',
            'A `SafeHtml` value works the same. Use it for app-owned texts only, never for user input.',
          ].join(' '),
        ].join('\n'),
      },
    },
  },
  decorators: [withTranslations({[LED_HINT_KEY]: LED_HINT_HTML})],
  render: () => ({
    template: `<ndwu-notification message="${LED_HINT_KEY}" />`,
  }),
};
