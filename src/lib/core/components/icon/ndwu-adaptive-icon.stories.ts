import {NDWU_ICON_NAMES, NdwuAdaptiveIconComponent, NdwuIconBaseName} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {adaptiveSizeArgType} from '@sb/helpers/arg-types';
import {AdaptiveSizeArg} from '@sb/helpers/story-args';
import {adaptiveSizeBinding, viewportSizeFlags} from '@sb/helpers/story-viewport';

type AdaptiveIconStoryArgs = NdwuAdaptiveIconComponent & AdaptiveSizeArg;

type Story = StoryObj<AdaptiveIconStoryArgs>;

const ICON_NAME_SET: ReadonlySet<string> = new Set(NDWU_ICON_NAMES);

const isIconBaseName = (base: string): base is NdwuIconBaseName => {
  return ICON_NAME_SET.has(`${base}_S`) && ICON_NAME_SET.has(`${base}_L`);
};

const ICON_BASE_NAMES: readonly NdwuIconBaseName[] = NDWU_ICON_NAMES
  .filter((name) => name.endsWith('_L'))
  .map((name) => name.slice(0, -2))
  .filter(isIconBaseName);

const SIZE_FLAGS = viewportSizeFlags('L', 'S');

const meta: Meta<AdaptiveIconStoryArgs> = {
  title: 'Core/Icon/Adaptive Icon',
  component: NdwuAdaptiveIconComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Icon that picks its `_S` or `_L` variant from size flags the app binds to `adaptiveSize`.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: ICON_BASE_NAMES,
      description: 'Base icon name without the size suffix; only icons that exist in `_S` and `_L`',
    },
    adaptiveSize: adaptiveSizeArgType(
      'Size flags: a map of size to `Signal<boolean>`; the first true flag in the order L, S wins, else L. Story values: `unbound` binds nothing (always L); `viewport` binds L on wide screens and S under `Breakpoints.Handset`',
    ),
  },
  args: {
    name: 'close',
    adaptiveSize: 'viewport',
  },
  render: (args) => {
    const attributes = [argsToTemplate(args, {exclude: ['adaptiveSize']}), adaptiveSizeBinding(args.adaptiveSize)];

    return {
      props: {...args, sizeFlags: SIZE_FLAGS},
      template: `<ndwu-adaptive-icon ${attributes.filter(Boolean).join(' ')} />`,
    };
  },
};

export default meta;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `viewport` the icon follows the Viewport toolbar: L on Tablet and Desktop, S on the mobile sizes. The story binds `sizeFlags = {L: isWide, S: isHandset}`, two signals from the `Breakpoints.Handset` media query; the library has no breakpoint of its own, so the app builds the flags. With `unbound` the icon is always L.',
      },
    },
  },
};
