import {NdwuButtonComponent} from '@ndw-ui-kit/core';
import {
  NdwuPopoverTriggerDirective,
  NdwuPopoverTriggerType,
  ndwuCreateDropdownController,
  ndwuCreatePopoverController,
  ndwuCreateTooltipController,
} from '@ndw-ui-kit/core/popover';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {CONTEXT_MENU_TEMPLATE, SbContextMenuComponent} from '@sb/demos/context-menu.component';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, outputArgType} from '@sb/helpers/arg-types';
import {lines} from '@sb/helpers/story-template';

const CONTROLLER_FACTORIES = {
  ndwuCreateDropdownController,
  ndwuCreatePopoverController,
  ndwuCreateTooltipController,
};

type ControllerFactoryName = keyof typeof CONTROLLER_FACTORIES;

type PopoverTriggerStoryArgs = Omit<NdwuPopoverTriggerDirective, 'popoverControllerFactory' | 'triggerOn'> & {
  popoverControllerFactory: ControllerFactoryName;
  triggerOn?: NdwuPopoverTriggerType | NdwuPopoverTriggerType[] | undefined;
};

type Story = StoryObj<PopoverTriggerStoryArgs>;

const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const CONTENT_TEMPLATE = `<ng-template #content>
  <div class="sb-overlay-panel">
    <p>Any template can be the content.</p>
    <button ndwu-button variant="tertiary" label="Action"></button>
  </div>
</ng-template>`;

const meta: Meta<PopoverTriggerStoryArgs> = {
  title: 'Popover API/Popover Trigger',
  component: NdwuPopoverTriggerDirective,
  tags: ['autodocs'],
  decorators: [moduleMetadata({imports: [NdwuButtonComponent]})],
  parameters: {
    docs: {
      description: {
        component:
          'Low-level directive that opens any content (template, component or string) in an overlay on click, hover, focus or `open()`. The controller factory decides the overlay: dropdown, popover panel or tooltip. The content brings its own panel. `ndwuPopover` and `ndwuTooltip` are built on it. The directive adds no ARIA: set `aria-haspopup` and `aria-expanded` on the host.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    popoverControllerFactory: {
      control: 'select',
      options: Object.keys(CONTROLLER_FACTORIES),
      description:
        'Overlay controller factory; takes precedence over the `NDWU_POPOVER_CONTROLLER_FACTORY` token. Read once, on the first open',
    },
    triggerOn: {
      control: {
        type: 'select',
        labels: {undefined: 'default (click)'},
      },
      options: [undefined, 'click', 'hover', 'focus'],
      description: 'What opens the overlay; `manual` opens it only through `open()` or `toggle()` (see `ContextMenu`)',
    },
    showDelay: {
      control: 'number',
      description: 'Delay before opening, in ms; hover and focus triggers only',
    },
    hideDelay: {
      control: 'number',
      description: 'Delay before closing, in ms; hover and focus triggers only',
    },
    popoverMinWidth: {
      control: 'number',
      description:
        'Minimum overlay width on desktop, in px; dropdown controller only (never below the host width). The popover-panel and tooltip controllers ignore it',
    },
    popoverTrapFocus: booleanArgType('Keeps Tab inside the overlay and focuses its first focusable element'),
    popoverCloseOnOriginClick: booleanArgType(
      'Click trigger: a pointer click on the host closes the overlay; Enter and Space still toggle. With the dropdown controller on desktop `false` also removes the backdrop. "Show code" omits `false`; write `[popoverCloseOnOriginClick]="false"` yourself',
    ),
    showOnTap: booleanArgType('Hover trigger: lets the hover that a tap emulates on touch devices open the overlay'),
    disabled: booleanArgType('Blocks opening; on `ndwu-button` the same binding also disables the button'),
    ndwuPopoverTrigger: {
      control: false,
      description: 'Content: a template, a component class or a string',
    },
    popoverContext: {
      control: false,
      description: 'Context of a template content (`let-` variables)',
    },
    popoverProviders: {
      control: false,
      description: 'DI providers for the content',
    },
    popoverClass: {
      control: false,
      description: 'CSS class(es) of the overlay pane; replaces the controller default',
    },
    opened: outputArgType('opened', 'Emits after the overlay opens'),
    closed: outputArgType('closed', 'Emits after the overlay closes'),
  },
  args: {
    popoverControllerFactory: 'ndwuCreateDropdownController',
    triggerOn: undefined,
    showDelay: 0,
    hideDelay: 150,
    popoverMinWidth: 0,
    popoverTrapFocus: false,
    popoverCloseOnOriginClick: true,
    showOnTap: false,
    disabled: false,
  },
  render: (args) => {
    return {
      props: {...args, ...CONTROLLER_FACTORIES},
      template: lines([
        `<button
  ndwu-button
  variant="secondary"
  label="Open popover"
  [ndwuPopoverTrigger]="content"
  [popoverControllerFactory]="${args.popoverControllerFactory}"
  ${argsToTemplate(args, {exclude: ['popoverControllerFactory']})}
></button>`,
        CONTENT_TEMPLATE,
      ]),
    };
  },
};

export default meta;

export const Default: Story = {};

export const ContextMenu: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'Right-click a target to open a menu at the pointer: `triggerOn="manual"` and `open()` with `originPoint`. The first target passes the factory through `[popoverControllerFactory]`; the second gets it from `NDWU_POPOVER_CONTROLLER_FACTORY` in the component `providers`, the path `hostDirectives` wrappers such as `ndwuTooltip` use, because a host can\'t bind the input of its host directive. The button opens the same menu on click, moves focus into it (`[popoverTrapFocus]="true"`) and stays open on a second click (`[popoverCloseOnOriginClick]="false"`); the directive adds no ARIA, so the button sets `aria-haspopup` and `aria-expanded` itself. Arrow keys, Home and End move between items, Tab cycles inside the menu; Escape closes. The class code (`open()`, `providers`, keyboard) is in `.storybook/demos/context-menu.component.ts`.',
      },
      source: {
        code: CONTEXT_MENU_TEMPLATE,
        language: 'html',
      },
    },
  },
  decorators: [moduleMetadata({imports: [SbContextMenuComponent]})],
  render: () => {
    return {
      template: '<sb-context-menu />',
    };
  },
};
