import {
  NDWU_ICON_BUTTON_VARIANT,
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuIconButtonComponent,
  type NdwuIconButtonVariant,
  type NdwuIconName,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {eventArgType, iconArgType, sizeArgType} from '@sb/helpers/arg-types';
import {SizeArg} from '@sb/helpers/story-args';
import {withRowLayout} from '@sb/helpers/story-layout';

type IconButtonStoryArgs = NdwuIconButtonComponent & SizeArg & {
  ariaLabel: string;
  click: (event: MouseEvent) => void;
};

type Story = StoryObj<IconButtonStoryArgs>;

interface VariantExample {
  variant: NdwuIconButtonVariant;
  icon: NdwuIconName;
  label: string;
}

const VARIANTS = Object.values(NDWU_ICON_BUTTON_VARIANT);
const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const VARIANT_EXAMPLES: readonly VariantExample[] = [
  {variant: NDWU_ICON_BUTTON_VARIANT.SQUARE, icon: NDWU_ICON_NAME.ADD_S, label: 'Square'},
  {variant: NDWU_ICON_BUTTON_VARIANT.ROUND, icon: NDWU_ICON_NAME.CHECK_S, label: 'Round'},
  {variant: NDWU_ICON_BUTTON_VARIANT.FLAT, icon: NDWU_ICON_NAME.SEARCH_L, label: 'Flat'},
];

const FLAT_ICONS: readonly NdwuIconName[] = [NDWU_ICON_NAME.CHECK_S, NDWU_ICON_NAME.SEARCH_L];

const lines = (items: readonly string[]): string => {
  return items.join('\n');
};

const meta: Meta<IconButtonStoryArgs> = {
  title: 'Core/Button/Icon Button',
  component: NdwuIconButtonComponent,
  tags: ['autodocs'],
  parameters: {
    sizes: SIZES,
    docs: {
      description: {
        component: 'Icon-only button. Add a native `aria-label`; this component has no accessible-name input.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    icon: {
      ...iconArgType,
      options: iconArgType.options?.filter((icon) => icon !== null) ?? [],
      description: 'Required icon displayed in the button',
    },
    variant: {
      control: 'select',
      options: VARIANTS,
      description: 'Visual shape of the button',
    },
    disabled: {
      description: 'Disables the button',
    },
    size: {
      ...sizeArgType(SIZES),
      description: 'Size of square and round variants; `flat` ignores it and uses the icon suffix (`_S` or `_L`).',
    },
    ariaLabel: {
      control: 'text',
      description: 'Native accessible name for the icon-only button',
      table: {category: 'story'},
    },
    click: eventArgType('click', 'Native click event'),
  },
  args: {
    icon: NDWU_ICON_NAME.ADD_S,
    variant: NDWU_ICON_BUTTON_VARIANT.SQUARE,
    disabled: false,
    size: undefined,
    ariaLabel: 'Add item',
  },
  render: (args) => ({
    props: args,
    template: `<button ndwu-icon-button ${
      argsToTemplate(args, {exclude: ['ariaLabel']})
    } aria-label="${args.ariaLabel}"></button>`,
  }),
};

export default meta;

export const Default: Story = {};

export const Variants: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines(
      VARIANT_EXAMPLES.map(({variant, icon, label}) => {
        return `<button ndwu-icon-button variant="${variant}" icon="${icon}" aria-label="${label} icon button"></button>`;
      }),
    ),
  }),
};

export const Sizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines(
      SIZES.map((size) => {
        return `<button ndwu-icon-button variant="square" size="${size}" icon="${NDWU_ICON_NAME.ADD_S}" aria-label="${size} square icon button"></button>`;
      }),
    ),
  }),
};

export const FlatIconSizes: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines(
      FLAT_ICONS.map((icon) => {
        return `<button ndwu-icon-button variant="flat" icon="${icon}" aria-label="Flat ${
          icon.endsWith('_S') ? 'small' : 'large'
        } icon button"></button>`;
      }),
    ),
  }),
};

export const Disabled: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines(
      VARIANTS.map((variant) => {
        return `<button ndwu-icon-button variant="${variant}" icon="${NDWU_ICON_NAME.ADD_S}" disabled aria-label="Disabled ${variant} icon button"></button>`;
      }),
    ),
  }),
};
