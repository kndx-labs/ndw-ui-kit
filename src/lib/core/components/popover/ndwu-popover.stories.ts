import {NdwuButtonComponent, NdwuPopoverAlign, NdwuPopoverDirective, NdwuPopoverSide} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {expect, screen} from 'storybook/test';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, textArgType} from '@sb/helpers/arg-types';
import {withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type Story = StoryObj<NdwuPopoverDirective>;

const SIDES: readonly NdwuPopoverSide[] = ['top', 'right', 'bottom', 'left'];
const ALIGNS: readonly NdwuPopoverAlign[] = ['start', 'center', 'end'];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const RICH_CONTENT_TEMPLATE = lines([
  `<button
  ndwu-button
  variant="primary"
  label="Open popover"
  [ndwuPopover]="richContent"
  popoverTitle="Important notice"
  [popoverButtons]="[{label: 'Cancel'}, {label: 'Confirm', primary: true}]"
></button>`,
  `<ng-template #richContent>
  <p>This popover contains <strong>formatted content</strong> with rich text support.</p>
  <p>You can include:</p>
  <ul>
    <li>Text paragraphs with <strong>bold</strong> formatting</li>
    <li>Bulleted lists for structured information</li>
    <li>Links to external resources</li>
  </ul>
  <p>The <em>footer</em> provides action buttons for the user to interact with.</p>
</ng-template>`,
]);

const meta: Meta<NdwuPopoverDirective> = {
  title: 'Core/Popover',
  component: NdwuPopoverDirective,
  tags: ['autodocs'],
  decorators: [moduleMetadata({imports: [NdwuButtonComponent]})],
  parameters: {
    docs: {
      description: {
        component:
          'Panel that opens on click next to its host: text or template content, an optional header with a title and a close button, footer action buttons. On phones it opens as a bottom sheet. Built on `Popover API/Popover Trigger` with the popover-panel controller.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    ndwuPopover: textArgType('Body content: a string or a template'),
    popoverTitle: textArgType('Header title; a non-empty title shows the header'),
    popoverShowHeader: booleanArgType('Shows the header also without a title'),
    popoverShowClose: booleanArgType(
      'Shows the close button: in the header, or floating at the top right without one. "Show code" omits `false`; write `[popoverShowClose]="false"` yourself',
    ),
    popoverCloseButtonAriaLabel: textArgType('Accessible name of the close button'),
    popoverButtons: {
      control: 'object',
      description: 'Footer buttons `{label, primary?, onClick?}`; a click runs `onClick` and closes the popover',
    },
    popoverSide: {
      control: 'select',
      options: SIDES,
      description:
        'Preferred side on desktop; falls back to the opposite side, then to the cross axis. A preview narrower than 600 px (portrait) or 960 px (landscape) gets a bottom sheet',
    },
    popoverAlign: {
      control: 'select',
      options: ALIGNS,
      description: 'Alignment along the side on desktop',
    },
    showDelay: {
      control: false,
      description: 'Delay before opening, in ms, for hover and focus triggers',
    },
    hideDelay: {
      control: false,
      description: 'Delay before closing, in ms, for hover and focus triggers',
    },
    triggerOn: {
      control: false,
      description: 'What opens the popover; default `click`. See Popover API/Popover Trigger',
    },
    popoverClass: {
      control: false,
      description: 'CSS class(es) of the overlay pane; default `ndwu-popover`',
    },
    popoverTrapFocus: {
      control: false,
      description: 'Keeps Tab inside the popover; default `true`',
    },
  },
  args: {
    ndwuPopover: 'This is a popover with helpful information about the feature.',
    popoverTitle: 'Help',
    popoverShowHeader: true,
    popoverShowClose: true,
    popoverCloseButtonAriaLabel: 'Close',
    popoverButtons: [],
    popoverSide: 'bottom',
    popoverAlign: 'center',
  },
  render: (args) => {
    return {
      props: args,
      template: `<button ndwu-button variant="secondary" label="Help" ${argsToTemplate(args)}></button>`,
    };
  },
};

export default meta;

export const Default: Story = {};

export const Simple: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'Text only. Without a title the close button floats at the top right.',
      },
    },
  },
  render: () => {
    return {
      template:
        '<button ndwu-button variant="secondary" label="Help" ndwuPopover="Port forwarding enables remote access to devices on your local network from the internet."></button>',
    };
  },
};

export const RichContent: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'A template as the body, a title and footer buttons. A footer click runs the button\'s `onClick` and closes the popover.',
      },
    },
  },
  render: () => {
    return {
      template: RICH_CONTENT_TEMPLATE,
    };
  },
};

export const Positions: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    layout: 'centered',
    docs: {
      description: {
        story:
          'Desktop positions: `popoverSide` picks the side, `popoverAlign` the alignment along it. Without room the popover moves to the opposite side, then to the cross axis. A preview narrower than 600 px (portrait) or 960 px (landscape) opens a bottom sheet for every button.',
      },
    },
  },
  decorators: [withStackLayout],
  render: () => {
    return {
      template: lines(
        SIDES.map((side) =>
          group(
            ALIGNS.map((align) => {
              return `<button ndwu-button variant="secondary" label="${side} / ${align}" ndwuPopover="Popover on the ${side} side, ${align} aligned." popoverSide="${side}" popoverAlign="${align}"></button>`;
            }),
          ),
        ),
      ),
    };
  },
};

export const OpenedForAccessibility: Story = {
  ...RichContent,
  tags: ['!autodocs'],
  parameters: FIXED_STORY_PARAMETERS,
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Open popover'}));
    await expect(await screen.findByRole('dialog')).toBeVisible();
  },
};
