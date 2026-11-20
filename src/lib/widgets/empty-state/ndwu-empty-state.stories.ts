import {NDWU_BUTTON_VARIANT, NDWU_SIZE, NdwuButtonComponent, NdwuButtonVariant} from '@ndw-ui-kit/core';
import {NdwuEmptyStateComponent} from '@ndw-ui-kit/core/widgets';
import {Meta, Parameters, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {
  adaptiveSizeArgType,
  pictogramBaseNameArgType,
  pictogramVariantArgType,
  sizeArgType,
  textArgType,
} from '@sb/helpers/arg-types';
import {AdaptiveSizeArg, SizeArg} from '@sb/helpers/story-args';
import {withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';
import {withTranslations} from '@sb/helpers/story-translations';
import {adaptiveSizeBinding, viewportSizeFlags} from '@sb/helpers/story-viewport';

type EmptyStateStoryArgs = NdwuEmptyStateComponent & SizeArg & AdaptiveSizeArg;

type Story = StoryObj<EmptyStateStoryArgs>;

interface EmptyStateAction {
  variant: NdwuButtonVariant;
  label: string;
}

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL];
const SIZES_LARGEST_FIRST = [NDWU_SIZE.XL, NDWU_SIZE.L];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const SIZE_FLAGS = viewportSizeFlags(NDWU_SIZE.XL, NDWU_SIZE.L);

const CANCEL: EmptyStateAction = {variant: NDWU_BUTTON_VARIANT.SECONDARY, label: 'Cancel'};
const RETRY: EmptyStateAction = {variant: NDWU_BUTTON_VARIANT.PRIMARY, label: 'Retry'};
const ACCEPT: EmptyStateAction = {variant: NDWU_BUTTON_VARIANT.PRIMARY, label: 'Accept'};
const DEFAULT_ACTIONS: readonly EmptyStateAction[] = [CANCEL, RETRY];

const LED_HINT_KEY = 'setup.led-hint';
const LED_HINT_HTML =
  'Wait until the <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #4caf50; position: relative; top: 1px;"></span> LED is lit and not blinking.';
const LED_HINT_TRANSLATIONS: Readonly<Record<string, string>> = {[LED_HINT_KEY]: LED_HINT_HTML};

const actionButton = ({variant, label}: EmptyStateAction): string => {
  return `  <button ndwu-button variant="${variant}" label="${label}"></button>`;
};

const emptyState = (attributes: string, actions: readonly EmptyStateAction[] = []): string => {
  if (actions.length === 0) {
    return `<ndwu-empty-state ${attributes} />`;
  }

  return `<ndwu-empty-state ${attributes}>\n${lines(actions.map(actionButton))}\n</ndwu-empty-state>`;
};

const fixedStoryParameters = (story: string): Parameters => {
  return {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {story},
    },
  };
};

const meta: Meta<EmptyStateStoryArgs> = {
  title: 'Widgets/Empty State',
  component: NdwuEmptyStateComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({imports: [NdwuButtonComponent]})],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component:
          'Placeholder for an empty list, a failed load or a finished task: pictogram, header, description and optional action buttons projected as content.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    pictogram: {
      ...pictogramBaseNameArgType,
      description:
        'Pictogram base name without the size suffix; XL uses the `_XL` pictogram (100 px), L the `_L` one (64 px)',
    },
    pictogramVariant: {
      ...pictogramVariantArgType,
      description: 'Colour preset of the pictogram',
    },
    header: textArgType(
      'Title text, HTML or a translation key, passed through `localizeHtml`. A plain string is sanitized: safe tags stay, `style` attributes and scripts are removed. Empty hides it',
    ),
    description: textArgType(
      'Body text, HTML or a translation key, passed through `localizeHtml` like `header`. Empty hides it',
    ),
    size: sizeArgType(SIZES),
    adaptiveSize: adaptiveSizeArgType(
      'Size flags: a map of size to `Signal<boolean>`; the largest true flag wins (XXL, XL, L, S) and beats `size` and the Size toolbar. Story values: `unbound` binds nothing; `viewport` binds XL on wide screens and L under `Breakpoints.Handset`',
    ),
  },
  args: {
    pictogram: 'pictogram_connection1',
    pictogramVariant: 'DEFAULT',
    header: 'Failed to upload',
    description: 'Please try again later',
    adaptiveSize: 'unbound',
  },
  render: (args) => {
    const attributes = [argsToTemplate(args, {exclude: ['adaptiveSize']}), adaptiveSizeBinding(args.adaptiveSize)];

    return {
      props: {...args, sizeFlags: SIZE_FLAGS},
      template: emptyState(attributes.filter(Boolean).join(' '), DEFAULT_ACTIONS),
    };
  },
};

export default meta;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Projected buttons take the size of the empty state. With `adaptiveSize` = `viewport` the card follows the Viewport toolbar: XL on Tablet and Desktop, L on the mobile sizes. The story binds `sizeFlags = {XL: isWide, L: isHandset}`, two signals from the `Breakpoints.Handset` media query; the component doesn\'t watch the viewport, so the app builds the flags, for example from `HANDSET_BREAKPOINT` (`@ndw-ui-kit/core/utils`). A bound flag beats `size` and the Size toolbar, so the story starts `unbound` and both work on load. The Viewport toolbar works on the story page, not on the docs page.',
      },
    },
  },
};

export const WithoutActions: Story = {
  parameters: fixedStoryParameters('Without projected content the actions area takes no space.'),
  render: () => ({
    template: emptyState('pictogram="pictogram_connection3" header="The list is empty"'),
  }),
};

export const SingleAction: Story = {
  parameters: fixedStoryParameters('Buttons are projected as content and centred below the text.'),
  render: () => ({
    template: emptyState(
      'pictogram="pictogram_connection2" header="Upload complete" description="Your file has been successfully uploaded"',
      [ACCEPT],
    ),
  }),
};

export const MultipleActions: Story = {
  parameters: fixedStoryParameters('Several buttons sit in one row with a 16 px gap and wrap on narrow screens.'),
  render: () => ({
    template: emptyState(
      'pictogram="pictogram_connection1" header="Failed to upload the file" description="Please try again later"',
      DEFAULT_ACTIONS,
    ),
  }),
};

export const Sizes: Story = {
  parameters: fixedStoryParameters(
    'XL uses the 100 px pictogram, L the 64 px one; padding, corner radius and the projected buttons follow the size.',
  ),
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      SIZES_LARGEST_FIRST.map((size) =>
        emptyState(
          `size="${size}" pictogram="pictogram_connection1" header="Uploading your file" description="This may take a few seconds"`,
          [CANCEL],
        )
      ),
    ),
  }),
};

export const HtmlText: Story = {
  parameters: fixedStoryParameters(
    'A string that is not a translation key is inserted as HTML through Angular\'s sanitizer: tags such as `<b>`, `<em>` and links stay, `style` attributes and scripts are removed.',
  ),
  render: () => ({
    template: emptyState(
      'pictogram="pictogram_info3" header="Update <b>failed</b>" description="Check the <b>internet connection</b> and try again. Details are in the <em>system log</em>."',
    ),
  }),
};

export const StyledHtml: Story = {
  parameters: fixedStoryParameters(
    `\`description\` is a translation key. The app's \`NdwuTranslationService\` resolves it to the HTML below, and \`localizeHtml\` trusts translated HTML, so the inline \`style\` stays. A \`SafeHtml\` value works the same. Use it for app-owned texts only, never for user input.\n\n\`\`\`html\n${LED_HINT_HTML}\n\`\`\``,
  ),
  decorators: [withTranslations(LED_HINT_TRANSLATIONS)],
  render: () => ({
    template: emptyState(`pictogram="pictogram_info3" header="Check the device" description="${LED_HINT_KEY}"`),
  }),
};
