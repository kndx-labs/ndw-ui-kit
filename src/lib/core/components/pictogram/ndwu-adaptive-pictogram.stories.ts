import {
  NDWU_PICTOGRAM_NAME,
  NDWU_PICTOGRAM_VARIANTS,
  NdwuAdaptivePictogramComponent,
  NdwuPictogramBaseName,
  NdwuPictogramName,
  NdwuPictogramVariant,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {adaptiveSizeArgType, booleanArgType} from '@sb/helpers/arg-types';
import {AdaptiveSizeArg} from '@sb/helpers/story-args';
import {withBoxLayout} from '@sb/helpers/story-layout';
import {adaptiveSizeBinding, viewportSizeFlags} from '@sb/helpers/story-viewport';

type AdaptivePictogramStoryArgs = NdwuAdaptivePictogramComponent & AdaptiveSizeArg;

type Story = StoryObj<AdaptivePictogramStoryArgs>;

const isPictogramVariant = (key: string): key is NdwuPictogramVariant => {
  return key in NDWU_PICTOGRAM_VARIANTS;
};

const VARIANTS: readonly NdwuPictogramVariant[] = Object.keys(NDWU_PICTOGRAM_VARIANTS).filter(isPictogramVariant);

const PICTOGRAM_NAMES: readonly NdwuPictogramName[] = Object.values(NDWU_PICTOGRAM_NAME);

const PICTOGRAM_NAME_SET: ReadonlySet<string> = new Set(PICTOGRAM_NAMES);

const isPictogramBaseName = (base: string): base is NdwuPictogramBaseName => {
  return PICTOGRAM_NAME_SET.has(`${base}_L`) && PICTOGRAM_NAME_SET.has(`${base}_XL`);
};

const PICTOGRAM_BASE_NAMES: readonly NdwuPictogramBaseName[] = PICTOGRAM_NAMES
  .filter((name) => name.endsWith('_XL'))
  .map((name) => name.slice(0, -3))
  .filter(isPictogramBaseName);

const SIZE_FLAGS = viewportSizeFlags('XL', 'L');

const meta: Meta<AdaptivePictogramStoryArgs> = {
  title: 'Core/Pictogram/Adaptive Pictogram',
  component: NdwuAdaptivePictogramComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Pictogram that picks its `_L` or `_XL` variant from size flags the app binds to `adaptiveSize`.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: PICTOGRAM_BASE_NAMES,
      description: 'Base pictogram name without the size suffix',
    },
    adaptiveSize: adaptiveSizeArgType(
      'Size flags: a map of size to `Signal<boolean>`; the first true flag in the order XL, L wins, else XL. Story values: `unbound` binds nothing (always XL); `viewport` binds XL on wide screens and L under `Breakpoints.Handset`',
    ),
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
      'Fills the host instead of the size from the flags; give the host a size with CSS. Here the host fills the dashed 160 px box',
    ),
  },
  args: {
    name: 'pictogram_empty',
    adaptiveSize: 'viewport',
    variant: 'DEFAULT',
    firstColor: '',
    secondColor: '',
    stretched: false,
  },
  render: (args) => {
    const attributes = [argsToTemplate(args, {exclude: ['adaptiveSize']}), adaptiveSizeBinding(args.adaptiveSize)];

    return {
      props: {...args, sizeFlags: SIZE_FLAGS},
      template: `<ndwu-adaptive-pictogram ${attributes.filter(Boolean).join(' ')} />`,
    };
  },
};

export default meta;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `viewport` the pictogram follows the Viewport toolbar: XL on Tablet and Desktop, L on the mobile sizes. The story binds `sizeFlags = {XL: isWide, L: isHandset}` from the `Breakpoints.Handset` media query. With `unbound` it is always XL.',
      },
    },
  },
  decorators: [withBoxLayout],
};
