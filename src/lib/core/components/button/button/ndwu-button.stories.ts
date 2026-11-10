import {
  NDWU_BUTTON_VARIANT,
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuButtonComponent,
  NdwuButtonVariant,
  NdwuIconName,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {eventArgType, iconArgType, sizeArgType} from '@sb/helpers/arg-types';
import {CssTokenArgs, CssTokenGroup, cssTokenArgTypes, withoutCssTokens} from '@sb/helpers/css-tokens';
import {SizeArg} from '@sb/helpers/story-args';
import {withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type ButtonStoryArgs = NdwuButtonComponent & SizeArg & CssTokenArgs & {
  content: string;
  click: (event: MouseEvent) => void;
};

type Story = StoryObj<ButtonStoryArgs>;

interface IconButton {
  variant: NdwuButtonVariant;
  icon: NdwuIconName;
  label: string;
}

const VARIANTS = Object.values(NDWU_BUTTON_VARIANT);
const SIZES = Object.values(NDWU_SIZE);
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const BUTTON_COLOR_TOKEN_SUFFIXES = [
  'bg',
  'border',
  'text',
  'icon-color',
  'hover-bg',
  'hover-border',
  'active-bg',
  'active-border',
  'active-text',
  'active-icon-color',
  'focus-bg',
  'focus-border',
  'disabled-bg',
  'disabled-border',
  'disabled-text',
  'disabled-icon-color',
] as const;

const CSS_TOKEN_GROUPS: readonly CssTokenGroup[] = VARIANTS.map((variant) => ({
  title: variant,
  keys: BUTTON_COLOR_TOKEN_SUFFIXES.map((suffix) => `button-${variant}-${suffix}`),
  textKeys: [`button-${variant}-focus-ring`],
  if: {arg: 'variant', eq: variant},
}));

const ICON_BUTTONS: readonly IconButton[] = [
  {variant: NDWU_BUTTON_VARIANT.PRIMARY, icon: NDWU_ICON_NAME.ADD_S, label: 'Primary'},
  {variant: NDWU_BUTTON_VARIANT.SECONDARY, icon: NDWU_ICON_NAME.CHECK_S, label: 'Secondary'},
  {variant: NDWU_BUTTON_VARIANT.TERTIARY, icon: NDWU_ICON_NAME.CHEVRON_RIGHT_S, label: 'Tertiary'},
];

const meta: Meta<ButtonStoryArgs> = {
  title: 'Core/Button/Button',
  component: NdwuButtonComponent,
  tags: ['autodocs', 'ready'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component: 'Action button: `<button ndwu-button>` with a variant, an optional icon and a loading state.',
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
      description: 'Visual style of the button',
    },
    disabled: {
      description: 'Disables the button; takes precedence over `loading`',
    },
    loading: {
      description: 'Shows a spinner and blocks clicks and key presses except Tab',
    },
    icon: {
      ...iconArgType,
      description: 'Icon shown before the label',
    },
    label: {
      description: 'Label text, passed through the `localize` pipe. When empty, projected content is shown',
    },
    size: sizeArgType(SIZES),
    content: {
      control: 'text',
      description: 'Projected content, shown when `label` is empty',
      table: {category: 'story'},
    },
    click: eventArgType('click', 'Native click event'),
    ...cssTokenArgTypes(CSS_TOKEN_GROUPS),
  },
  args: {
    variant: NDWU_BUTTON_VARIANT.PRIMARY,
    disabled: false,
    loading: false,
    icon: null,
  },
  render: (args) => {
    const storyArgs = withoutCssTokens(args);
    const argsStr = argsToTemplate(storyArgs, {exclude: ['content']});

    return {
      props: storyArgs,
      template: `<button ndwu-button ${argsStr}>{{ content }}</button>`,
    };
  },
};

export default meta;

export const Default: Story = {
  args: {
    label: 'Button',
  },
};

export const Loading: Story = {
  args: {
    label: 'Button',
    loading: true,
  },
};

export const Variants: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines(VARIANTS.map((variant) => `<button ndwu-button variant="${variant}" label="${variant}"></button>`)),
  }),
};

export const WithIcon: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines(
      ICON_BUTTONS.map(({variant, icon, label}) =>
        `<button ndwu-button variant="${variant}" icon="${icon}" label="${label}"></button>`
      ),
    ),
  }),
};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines(SIZES.map((size) => `<button ndwu-button size="${size}" label="Size ${size}"></button>`)),
  }),
};

export const States: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      group(
        VARIANTS.map((variant) =>
          `<button ndwu-button variant="${variant}" [loading]="true" label="${variant}, loading"></button>`
        ),
      ),
      group(
        VARIANTS.map((variant) =>
          `<button ndwu-button variant="${variant}" [disabled]="true" label="${variant}, disabled"></button>`
        ),
      ),
    ]),
  }),
};

export const ProjectedContent: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  args: {
    content: 'Projected content',
  },
};
