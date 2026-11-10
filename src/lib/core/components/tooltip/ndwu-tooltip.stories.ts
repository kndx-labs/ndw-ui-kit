import {
  NDWU_ICON_NAME,
  NdwuButtonComponent,
  NdwuIconComponent,
  type NdwuPopoverAlign,
  NdwuTooltipDirective,
  type NdwuTooltipPosition,
} from '@ndw-ui-kit/core';
import type {NdwuPopoverTriggerType} from '@ndw-ui-kit/core/popover';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {expect, screen, userEvent} from 'storybook/test';
import {SbTooltipStripComponent, TOOLTIP_STRIP_TEMPLATE} from '@sb/demos/tooltip-strip.component';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, textArgType} from '@sb/helpers/arg-types';
import {withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type TooltipStoryArgs = Omit<NdwuTooltipDirective, 'triggerOn'> & {
  triggerOn?: NdwuPopoverTriggerType | NdwuPopoverTriggerType[] | undefined;
};

type Story = StoryObj<TooltipStoryArgs>;

const POSITIONS: readonly NdwuTooltipPosition[] = ['auto', 'above', 'below', 'left', 'right'];
const SIDES: readonly NdwuTooltipPosition[] = ['above', 'left', 'right', 'below'];
const ALIGNS: readonly NdwuPopoverAlign[] = ['center', 'start', 'end'];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const SHORT_TEXT = 'Shared with me';
const LONG_TEXT = 'Copy hexadecimal value to clipboard Copy hexadecimal value to clipboard value to clipboard '
  + 'value to clipboard value to clipboard value value';
const HTML_TEXT = 'Status: <b>online</b><br />Last seen: <i>2 minutes ago</i>';
const ICON_TEXT = 'This icon provides additional information about the status.';

const HTML_TRIGGER =
  `<button ndwu-button variant="secondary" label="Device status" ndwuTooltip="${HTML_TEXT}"></button>`;

const STRIP_DOCS = {
  source: {
    code: TOOLTIP_STRIP_TEMPLATE,
    language: 'html',
  },
};

const STRIP_HANDLERS_NOTE = 'The handlers and signals live in `.storybook/demos/tooltip-strip.component.ts`.';

const meta: Meta<TooltipStoryArgs> = {
  title: 'Core/Tooltip',
  component: NdwuTooltipDirective,
  tags: ['autodocs'],
  decorators: [moduleMetadata({imports: [NdwuButtonComponent]})],
  parameters: {
    docs: {
      description: {
        component:
          'Hint shown on hover (tap on touch screens) for its host element. Content is text, HTML or a template; one directive can serve many targets through `tooltipOrigin`.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    ndwuTooltip: textArgType('Content: a string (text or HTML, passed through `localizeHtml`) or a template'),
    tooltipPosition: {
      control: 'select',
      options: POSITIONS,
      description:
        'Preferred side; the tooltip falls back to the other sides when there is no room. `auto` tries below first',
    },
    tooltipAlign: {
      control: 'select',
      options: ALIGNS,
      description: 'Alignment along the chosen side',
    },
    showDelay: {
      control: 'number',
      description: 'Delay before opening, ms',
      table: {defaultValue: {summary: '300'}},
    },
    hideDelay: {
      control: 'number',
      description: 'Delay before closing after the pointer leaves, ms',
      table: {defaultValue: {summary: '200'}},
    },
    triggerOn: {
      control: {
        type: 'select',
        labels: {undefined: 'default'},
      },
      options: [undefined, 'hover', 'click', 'focus'],
      description: 'What opens the tooltip. `default` is `hover`, or `click` on touch-only devices',
      table: {defaultValue: {summary: '\'hover\' (\'click\' on touch-only devices)'}},
    },
    tooltipMaxWidth: textArgType('CSS `max-width`; by default 300px, narrower on small screens'),
    showOnTap: booleanArgType(
      'On devices with touch and a mouse, lets the hover emulated by a tap open the tooltip; ignored by default',
    ),
    tooltipContext: {
      control: false,
      description: 'Value passed to a template `ndwuTooltip` as `$implicit`; see Shared Tooltip',
    },
    tooltipOrigin: {
      control: false,
      description: 'Element or viewport point to anchor to instead of the host; see Shared Tooltip and Follow Cursor',
    },
    tooltipDescribeHost: {
      control: false,
      description:
        'Whether the host gets `aria-describedby`; set to false when the described elements are other targets',
    },
    tooltipRestoreFocus: {
      control: false,
      description: 'Whether closing may move focus back to the host; set to false with roving focus',
    },
    popoverClass: {
      control: false,
      description: 'CSS class(es) of the overlay pane',
      table: {defaultValue: {summary: '\'ndwu-tooltip\''}},
    },
    popoverTrapFocus: {
      control: false,
      description: 'Traps focus inside the tooltip',
    },
    getProviders: {
      table: {disable: true},
    },
  },
  args: {
    ndwuTooltip: 'Tooltip text',
    tooltipPosition: 'auto',
    tooltipAlign: 'center',
    showDelay: 300,
    hideDelay: 200,
    triggerOn: undefined,
    tooltipMaxWidth: null,
    showOnTap: false,
  },
  render: (args) => ({
    props: args,
    template: `<button ndwu-button variant="secondary" label="Hover me" ${argsToTemplate(args)}></button>`,
  }),
};

export default meta;

export const Default: Story = {};

export const SingleAndMultiline: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => ({
    template: lines([
      `<button ndwu-button variant="tertiary" label="Short text" ndwuTooltip="${SHORT_TEXT}" tooltipPosition="below"></button>`,
      `<button ndwu-button variant="tertiary" label="Long text" ndwuTooltip="${LONG_TEXT}" tooltipPosition="below"></button>`,
    ]),
  }),
};

export const Positions: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'Each button prefers one side and alignment; without room on that side the tooltip uses the next one.',
      },
    },
  },
  decorators: [withStackLayout],
  render: () => ({
    template: lines(
      SIDES.map((side) =>
        group(
          ALIGNS.map((align) =>
            `<button ndwu-button variant="tertiary" label="${side} ${align}" ndwuTooltip="${LONG_TEXT}" tooltipPosition="${side}" tooltipAlign="${align}"></button>`
          ),
        )
      ),
    ),
  }),
};

export const OnIcon: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'On a device with touch and a mouse, a tap fires an emulated hover. It is ignored by default; `showOnTap` lets it open the tooltip.',
      },
    },
  },
  decorators: [moduleMetadata({imports: [NdwuIconComponent]})],
  render: () => ({
    template: `<ndwu-icon name="${NDWU_ICON_NAME.INFO_L}" ndwuTooltip="${ICON_TEXT}" [showOnTap]="true" />`,
  }),
};

export const HtmlContent: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'A plain string is rendered as HTML after Angular sanitization, which removes inline `style` attributes. A translation key that resolves to HTML, or a `SafeHtml` value, keeps them.',
      },
    },
  },
  render: () => ({
    template: HTML_TRIGGER,
  }),
};

export const SharedTooltip: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      ...STRIP_DOCS,
      description: {
        story:
          `One tooltip with template content serves 48 cells through \`tooltipOrigin\`. Click a cell or Tab into the strip; the arrow keys move the tooltip without closing it; Escape or leaving the strip closes it. ${STRIP_HANDLERS_NOTE}`,
      },
    },
  },
  decorators: [moduleMetadata({imports: [SbTooltipStripComponent]})],
  render: () => ({
    template: '<sb-tooltip-strip mode="click" />',
  }),
};

export const FollowCursor: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      ...STRIP_DOCS,
      description: {
        story:
          `The tooltip opens when the pointer enters the strip, follows it and shows the cell under it (\`tooltipOrigin\` is a viewport point). Keyboard focus anchors it to the focused cell instead. ${STRIP_HANDLERS_NOTE}`,
      },
    },
  },
  decorators: [moduleMetadata({imports: [SbTooltipStripComponent]})],
  render: () => ({
    template: '<sb-tooltip-strip mode="pointer" />',
  }),
};

export const OpenedForAccessibility: Story = {
  tags: ['!autodocs'],
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'A closed tooltip is not in the DOM. `play` hovers the trigger and waits for the tooltip, so the Accessibility panel checks its content.',
      },
    },
  },
  render: () => ({
    template: HTML_TRIGGER,
  }),
  play: async ({canvas}) => {
    await userEvent.hover(canvas.getByRole('button', {name: 'Device status'}));
    await expect(await screen.findByRole('tooltip')).toBeVisible();
  },
};
