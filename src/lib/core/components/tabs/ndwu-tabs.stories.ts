import {signal} from '@angular/core';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuBadgeTone,
  NdwuTabItem,
  NdwuTabVariant,
  NdwuTabWidthMode,
  NdwuTabsComponent,
  NdwuTabsScrollMode,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {booleanArgType, iconArgType, outputArgType, textArgType} from '@sb/helpers/arg-types';
import {withControlledArgs} from '@sb/helpers/story-controlled';
import {withStackLayout} from '@sb/helpers/story-layout';
import {group, lines} from '@sb/helpers/story-template';

type TabItemArgs = Required<Pick<NdwuTabItem, 'icon' | 'badge' | 'badgeTone' | 'disabled'>>;

type TabsStoryArgs = NdwuTabsComponent & TabItemArgs;

type Story = StoryObj<TabsStoryArgs>;

const SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const VARIANTS: readonly NdwuTabVariant[] = ['default', 'bordered'];
const SCROLL_MODES: readonly NdwuTabsScrollMode[] = ['auto', 'scrollable'];
const TAB_WIDTH_MODES: readonly NdwuTabWidthMode[] = ['content', 'fixed'];
const TONES: readonly NdwuBadgeTone[] = ['gray', 'negative', 'positive', 'warning', 'blue', 'violet', 'cyan', 'white'];
const TAB_FIELDS = ['id', 'label', 'icon', 'badge', 'badgeTone', 'disabled', 'widthMode'] as const;
const SELECTED_TAB_ID = 'tab2';
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const WIRED_SELECTION: readonly string[] = ['[selectedTabId]="activeTabId()"', '(tabChange)="activeTabId.set($event)"'];
const ITEM_INPUTS_TABLE = {category: 'item inputs'};

const PLAIN_TABS: readonly NdwuTabItem[] = [
  {id: 'tab1', label: 'Tab 1'},
  {id: 'tab2', label: 'Tab 2'},
  {id: 'tab3', label: 'Tab 3', disabled: true},
  {id: 'tab4', label: 'Tab 4'},
];

const BADGE_TABS: readonly NdwuTabItem[] = [
  {id: 'tab1', label: 'Tab 1', badge: '2', badgeTone: 'negative'},
  {id: 'tab2', label: 'Tab 2', badge: '1'},
  {id: 'tab3', label: 'Tab 3', badge: '99+', disabled: true},
  {id: 'tab4', label: 'Tab 4', badge: '99+', badgeTone: 'warning'},
];

const ICON_TABS: readonly NdwuTabItem[] = [
  {id: 'tab1', label: 'Tab 1', icon: NDWU_ICON_NAME.BELL_ON_L},
  {id: 'tab2', label: 'Tab 2', icon: NDWU_ICON_NAME.FOLDER_L},
  {id: 'tab3', label: 'Tab 3', icon: NDWU_ICON_NAME.SETTINGS_L, disabled: true},
  {id: 'tab4', label: 'Tab 4', icon: NDWU_ICON_NAME.CHART_L},
];

const NETWORK_TABS: readonly NdwuTabItem[] = [
  {id: 'tab1', label: 'Wi-Fi settings'},
  {id: 'tab2', label: 'Lan configuration'},
  {id: 'tab3', label: 'Port forwarding', disabled: true},
  {id: 'tab4', label: 'Diagnostics'},
  {id: 'tab5', label: 'Security'},
  {id: 'tab6', label: 'Advanced settings'},
];

const SHORT_NETWORK_TABS = NETWORK_TABS.slice(0, 4);

const MIXED_WIDTH_TABS: readonly NdwuTabItem[] = [
  {id: 'tab1', label: 'Content width'},
  {id: 'tab2', label: 'Fixed', widthMode: 'fixed'},
  {id: 'tab3', label: 'Content width', disabled: true},
  {id: 'tab4', label: 'Fixed', widthMode: 'fixed'},
];

const TAB_IDS = NETWORK_TABS.map(({id}) => id);

const TAB_LABELS = Object.fromEntries(NETWORK_TABS.map(({id, label}) => [id, label]));

const quote = (value: string): string => {
  const escaped = value
    .replaceAll('\\', '\\\\')
    .replaceAll('\'', '\\\'')
    .replaceAll('"', '&quot;');

  return `'${escaped}'`;
};

const tabLiteral = (tab: NdwuTabItem): string => {
  const fields = TAB_FIELDS.flatMap((key) => {
    const value = tab[key];

    if (
      value === undefined || value === null || value === false || value === ''
      || (key === 'badgeTone' && !tab.badge)
    ) {
      return [];
    }

    return [`${key}: ${typeof value === 'string' ? quote(value) : String(value)}`];
  });

  return `{${fields.join(', ')}}`;
};

const tabsElement = (tabs: readonly NdwuTabItem[], attributes: readonly string[]): string => {
  return lines([
    '<ndwu-tabs',
    '  [tabs]="[',
    tabs.map((tab) => `    ${tabLiteral(tab)}`).join(',\n'),
    '  ]"',
    ...attributes.map((attribute) => `  ${attribute}`),
    '/>',
  ]);
};

const withFirstTab = (tabs: readonly NdwuTabItem[], {icon, badge, badgeTone, disabled}: TabItemArgs): NdwuTabItem[] => {
  return tabs.map((tab, index) => (index === 0 ? {...tab, icon, badge, badgeTone, disabled} : tab));
};

const wiredRender = (template: string): NonNullable<Story['render']> => {
  return () => ({
    props: {activeTabId: signal(SELECTED_TAB_ID)},
    template,
  });
};

const meta: Meta<TabsStoryArgs> = {
  title: 'Core/Tabs',
  component: NdwuTabsComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tab bar: `ndwu-tabs` renders a `button[ndwu-tab-item]` for each entry of `tabs`. The app keeps the selection: bind `selectedTabId` and update it from `tabChange`; in the examples below `activeTabId` is a `signal` in the host component.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    tabs: {
      control: 'object',
      description:
        'Tabs to show: `id`, `label` (passed through `localize`) and optional `icon`, `badge`, `badgeTone`, `disabled`, `widthMode`. The item inputs below replace these fields of the first tab',
    },
    selectedTabId: {
      control: {
        type: 'select',
        labels: {null: 'none', ...TAB_LABELS},
      },
      options: [null, ...TAB_IDS],
      description: 'Id of the selected tab; update it from `tabChange`',
    },
    size: {
      control: 'select',
      options: SIZES,
      description: 'Size of the bar and its tabs. The bar\'s own input: the Size toolbar does not apply',
    },
    variant: {
      control: 'select',
      options: VARIANTS,
      description:
        '`default`: tabs in a bar with a border and background; `bordered`: joined tab buttons, the selected one with a top accent line',
    },
    scrollMode: {
      control: 'select',
      options: SCROLL_MODES,
      description:
        '`auto`: the bar fits its tabs; `scrollable`: the bar is `scrollContainerWidth` wide and scrolls horizontally with a hidden scrollbar',
    },
    scrollContainerWidth: textArgType(
      'CSS width of the bar in `scrollable` mode, e.g. `368px`; not used in `auto` mode',
    ),
    tabWidthMode: {
      control: 'select',
      options: TAB_WIDTH_MODES,
      description:
        '`content`: each tab fits its label; `fixed`: 64 px at L, 160 px at XL and XXL, long labels end with an ellipsis. A tab\'s own `widthMode` overrides it',
    },
    icon: {
      ...iconArgType,
      description: 'First tab: icon before the label',
      table: ITEM_INPUTS_TABLE,
    },
    badge: {
      ...textArgType('First tab: badge text after the label, e.g. a count'),
      table: ITEM_INPUTS_TABLE,
    },
    badgeTone: {
      control: 'select',
      options: TONES,
      description: 'First tab: badge colour; a disabled tab shows a gray badge',
      table: ITEM_INPUTS_TABLE,
    },
    disabled: {
      ...booleanArgType('First tab: can\'t be selected and is skipped by Tab; `tabChange` is not emitted for it'),
      table: ITEM_INPUTS_TABLE,
    },
    tabChange: outputArgType(
      'tabChange',
      'Emits the id of the clicked tab, also when it is already selected; never for a disabled tab',
    ),
  },
  args: {
    tabs: [...NETWORK_TABS],
    selectedTabId: SELECTED_TAB_ID,
    size: NDWU_SIZE.L,
    variant: 'default',
    scrollMode: 'auto',
    scrollContainerWidth: '368px',
    tabWidthMode: 'content',
    icon: null,
    badge: null,
    badgeTone: 'blue',
    disabled: false,
  },
  render: (args) => {
    const scrollKeys: (keyof TabsStoryArgs)[] = args.scrollMode === 'scrollable' ? ['scrollContainerWidth'] : [];

    return {
      props: args,
      template: tabsElement(withFirstTab(args.tabs, args), [
        argsToTemplate(args, {
          include: ['selectedTabId', 'size', 'variant', 'scrollMode', ...scrollKeys, 'tabWidthMode', 'tabChange'],
        }),
      ]),
    };
  },
};

export default meta;

export const Default: Story = {
  decorators: [withControlledArgs('tabChange', (selectedTabId) => ({selectedTabId}))],
};

export const DefaultVariant: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          'The default variant: tabs in a bar with a border and background. A tab can show a badge (gray when the tab is disabled) or an icon. The app keeps the selection: bind `selectedTabId` and set it from `tabChange`.',
      },
    },
  },
  decorators: [withStackLayout],
  render: wiredRender(
    lines([PLAIN_TABS, BADGE_TABS, ICON_TABS].map((tabs) => group([tabsElement(tabs, WIRED_SELECTION)]))),
  ),
};

export const ScrollModes: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          '`auto` (default) sizes the bar to its tabs. `scrollable` makes the bar `scrollContainerWidth` wide (here 368 px) and scrolls it horizontally; the scrollbar is hidden.',
      },
    },
  },
  decorators: [withStackLayout],
  render: wiredRender(
    lines([
      group([tabsElement(SHORT_NETWORK_TABS, ['scrollMode="auto"', ...WIRED_SELECTION])]),
      group([
        tabsElement(NETWORK_TABS, ['scrollMode="scrollable"', 'scrollContainerWidth="368px"', ...WIRED_SELECTION]),
      ]),
    ]),
  ),
};

export const TabWidthModes: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          '`content` (default) fits each tab to its label. `fixed` gives every tab the same width: 64 px at L, 160 px at XL and XXL; a long label ends with an ellipsis. A tab\'s own `widthMode` overrides `tabWidthMode`: in the third row the second and fourth tabs are fixed.',
      },
    },
  },
  decorators: [withStackLayout],
  render: wiredRender(
    lines([
      group([tabsElement(PLAIN_TABS, ['tabWidthMode="content"', ...WIRED_SELECTION])]),
      group([tabsElement(PLAIN_TABS, ['tabWidthMode="fixed"', ...WIRED_SELECTION])]),
      group([tabsElement(MIXED_WIDTH_TABS, WIRED_SELECTION)]),
    ]),
  ),
};

export const BorderedVariant: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story:
          '`variant="bordered"` shows joined tab buttons without the bar background; the selected tab gets a top accent line. Shown at size XXL.',
      },
    },
  },
  render: wiredRender(tabsElement(PLAIN_TABS, ['variant="bordered"', 'size="XXL"', ...WIRED_SELECTION])),
};
