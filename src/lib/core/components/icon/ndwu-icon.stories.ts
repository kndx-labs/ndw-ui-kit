import {NDWU_ICON_NAME, NDWU_ICON_NAMES, NdwuIconComponent, NdwuIconName} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType} from '@sb/helpers/arg-types';
import {withBoxLayout, withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type Story = StoryObj<NdwuIconComponent>;

const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const COLOR_ICONS: readonly NdwuIconName[] = [
  NDWU_ICON_NAME.ADD_L,
  NDWU_ICON_NAME.CHECK_L,
  NDWU_ICON_NAME.CLOSE_L,
  NDWU_ICON_NAME.SEARCH_L,
  NDWU_ICON_NAME.SETTINGS_L,
];

const ICON_COLORS: readonly string[] = [
  'var(--ndwu-color-brand-50)',
  'var(--ndwu-color-green-50)',
  'var(--ndwu-color-red-50)',
];

const COLOR_ROW: readonly string[] = COLOR_ICONS.map((name) => `<ndwu-icon name="${name}" />`);

const meta: Meta<NdwuIconComponent> = {
  title: 'Core/Icon/Icon',
  component: NdwuIconComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'SVG icon from the kit sprite, drawn in `currentColor`; the name suffix sets the size.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: NDWU_ICON_NAMES,
      description:
        'Icon name from `NDWU_ICON_NAME`. The suffix sets the size: `_XS` 16 px, `_S` 20 px, `_L` 24 px, `_XL` 50 px. An unknown name shows `warning_S` and logs a warning',
    },
    stretched: booleanArgType(
      'Fills the host instead of the size from the suffix; give the host a size with CSS. Here the host fills the dashed 160 px box',
    ),
  },
  args: {
    name: NDWU_ICON_NAME.ADD_L,
    stretched: false,
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-icon ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {
  decorators: [withBoxLayout],
};

export const Colors: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Icons are drawn in `currentColor`: set CSS `color` on the icon or on an ancestor. The first row inherits the text colour; the others use brand, green and red kit tokens, which follow the theme.',
      },
    },
  },
  decorators: [withStackLayout],
  render: () => ({
    template: lines([
      group(COLOR_ROW),
      ...ICON_COLORS.map((color) => `<div style="color: ${color}">\n${lines(COLOR_ROW)}\n</div>`),
    ]),
  }),
};
