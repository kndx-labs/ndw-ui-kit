import {
  NDWU_PICTOGRAM_NAME,
  NDWU_PICTOGRAM_VARIANTS,
  NdwuPictogramComponent,
  NdwuPictogramName,
  NdwuPictogramVariant,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType} from '@sb/helpers/arg-types';
import {withBoxLayout, withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type Story = StoryObj<NdwuPictogramComponent>;

interface ColorPair {
  firstColor: string;
  secondColor: string;
}

const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const isPictogramVariant = (key: string): key is NdwuPictogramVariant => {
  return key in NDWU_PICTOGRAM_VARIANTS;
};

const VARIANTS: readonly NdwuPictogramVariant[] = Object.keys(NDWU_PICTOGRAM_VARIANTS).filter(isPictogramVariant);

const PICTOGRAM_NAMES: readonly NdwuPictogramName[] = Object.values(NDWU_PICTOGRAM_NAME);

const SAMPLE_PICTOGRAMS: readonly NdwuPictogramName[] = [
  NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L,
  NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_XL,
  NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION2_L,
  NDWU_PICTOGRAM_NAME.PICTOGRAM_INFO3_L,
];

const SIZE_PICTOGRAMS: readonly NdwuPictogramName[] = [
  NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L,
  NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_XL,
];

const CUSTOM_COLORS: readonly ColorPair[] = [
  {firstColor: '#FF6B6B', secondColor: '#4ECDC4'},
  {firstColor: 'var(--ndwu-color-red-50)', secondColor: 'var(--ndwu-color-red-10)'},
];

const meta: Meta<NdwuPictogramComponent> = {
  title: 'Core/Pictogram/Pictogram',
  component: NdwuPictogramComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Two-colour illustration from the pictogram sprite, in five colour presets or custom colours.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: PICTOGRAM_NAMES,
      description:
        'Pictogram name from `NDWU_PICTOGRAM_NAME`. The suffix sets the size: `_L` 64 px, `_XL` 100 px. An unknown name shows the first pictogram and logs a warning',
    },
    variant: {
      control: 'select',
      options: VARIANTS,
      description: 'Colour preset; its hex colours are the same in both themes',
    },
    firstColor: {
      control: 'color',
      description: 'Any CSS colour for the main shape; empty uses the variant colour',
    },
    secondColor: {
      control: 'color',
      description: 'Any CSS colour for the background shape; empty uses the variant colour',
    },
    stretched: booleanArgType(
      'Fills the host instead of the size from the suffix; give the host a size with CSS. Here the host fills the dashed 160 px box',
    ),
  },
  args: {
    name: NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L,
    variant: 'DEFAULT',
    firstColor: '',
    secondColor: '',
    stretched: false,
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-pictogram ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {
  decorators: [withBoxLayout],
};

export const Variants: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'The five presets from left to right: `DEFAULT`, `INFO`, `SUCCESS`, `WARNING`, `DISABLED`.',
      },
    },
  },
  decorators: [withRowLayout],
  render: () => ({
    template: lines(
      VARIANTS.map((variant) =>
        `<ndwu-pictogram name="${NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L}" variant="${variant}" />`
      ),
    ),
  }),
};

export const Sizes: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'The name suffix sets the size: `_L` 64 px, `_XL` 100 px.',
      },
    },
  },
  decorators: [withRowLayout],
  render: () => ({
    template: lines(SIZE_PICTOGRAMS.map((name) => `<ndwu-pictogram name="${name}" />`)),
  }),
};

export const CustomColors: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          '`firstColor` and `secondColor` take any CSS colour and override the variant. Hex colours stay the same in both themes; kit tokens (second row) follow the theme.',
      },
    },
  },
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      CUSTOM_COLORS.map(({firstColor, secondColor}) =>
        group(
          SAMPLE_PICTOGRAMS.map((name) =>
            `<ndwu-pictogram name="${name}" firstColor="${firstColor}" secondColor="${secondColor}" />`
          ),
        )
      ),
    ),
  }),
};
