import {computed, signal} from '@angular/core';
import {ndwuScheduleValueToActions} from '@ndw-ui-kit/core/schedule-actions';
import {
  NDWU_DEFAULT_WEEK_DAYS,
  NDWU_SCHEDULE_EDITOR_LAYOUT,
  NDWU_SCHEDULE_EDITOR_MODE,
  NDWU_SCHEDULE_EDITOR_SIZING,
  NdwuScheduleEditorComponent,
  NdwuScheduleInterval,
  NdwuScheduleValue,
  NdwuWeekDay,
} from '@ndw-ui-kit/core/widgets';
import {Decorator, Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {outputArgType} from '@sb/helpers/arg-types';
import {withControlledArgs} from '@sb/helpers/story-controlled';
import {withResizableLayout, withStackLayout, withValueOutput} from '@sb/helpers/story-layout';

type Story = StoryObj<NdwuScheduleEditorComponent>;

const MODES = Object.values(NDWU_SCHEDULE_EDITOR_MODE);
const SIZINGS = Object.values(NDWU_SCHEDULE_EDITOR_SIZING);
const LAYOUTS = [null, ...Object.values(NDWU_SCHEDULE_EDITOR_LAYOUT)];
const FIXED_STORY_PARAMETERS = {controls: {disable: true}};
const WORKDAY: NdwuScheduleInterval[] = [[540, 1080]];

const SAMPLE_VALUE: NdwuScheduleValue = {
  mon: WORKDAY,
  tue: WORKDAY,
  wed: WORKDAY,
  thu: WORKDAY,
  fri: WORKDAY,
};

const SUNDAY_FIRST_WEEK_DAYS: NdwuWeekDay[] = [
  {day: 'sun', label: 'Sun'},
  {day: 'mon', label: 'Mon'},
  {day: 'tue', label: 'Tue'},
  {day: 'wed', label: 'Wed'},
  {day: 'thu', label: 'Thu'},
  {day: 'fri', label: 'Fri'},
  {day: 'sat', label: 'Sat'},
];

const intervalsLiteral = (intervals: readonly NdwuScheduleInterval[]): string => {
  return `[${intervals.map(([start, stop]) => `[${start}, ${stop}]`).join(', ')}]`;
};

const valueLiteral = (value: NdwuScheduleValue): string => {
  const days = Object.entries(value).map(([day, intervals]) => `${day}: ${intervalsLiteral(intervals ?? [])}`);

  return `{${days.join(', ')}}`;
};

const weekDaysLiteral = (weekDays: readonly NdwuWeekDay[]): string => {
  return `[${weekDays.map(({day, label}) => `{day: '${day}', label: '${label}'}`).join(', ')}]`;
};

const editorSourceTransform: typeof argsSourceTransform = (code, context) => {
  const value = context.args['value'] as NdwuScheduleValue;
  const weekDays = context.args['weekDays'] as NdwuWeekDay[];
  const bindings = [` [value]="${valueLiteral(value)}"`];

  if (weekDays !== NDWU_DEFAULT_WEEK_DAYS) {
    bindings.push(` [weekDays]="${weekDaysLiteral(weekDays)}"`);
  }

  return argsSourceTransform(code, context)
    .replace(' [value]="schedule()"', '')
    .replace(' (valueChange)="onValueChange($event)"', '')
    .replace(' />', `${bindings.join('')} />`);
};

const withFillLayout: Decorator = (storyFn, context) => {
  return context.args['sizing'] === NDWU_SCHEDULE_EDITOR_SIZING.FILL
    ? withResizableLayout(storyFn, context)
    : storyFn();
};

const SAMPLE_VALUE_LITERAL = valueLiteral(SAMPLE_VALUE);

const meta: Meta<NdwuScheduleEditorComponent> = {
  title: 'Widgets/Schedule Editor',
  component: NdwuScheduleEditorComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Weekly schedule grid: drag over the slots to add or remove 30-minute intervals;',
          'controlled through `value` and `valueChange`.',
        ].join(' '),
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    value: {
      control: 'object',
      description: [
        'Schedule: day name → list of `[start, stop]` intervals in minutes from midnight.',
        'The editor keeps no value of its own: write the value from `valueChange` back',
      ].join(' '),
    },
    mode: {
      control: 'select',
      options: MODES,
      description: '`full`: grid with hours and day labels that takes drags; `thumbnail`: small read-only preview',
      table: {defaultValue: {summary: 'full'}},
    },
    sizing: {
      control: 'select',
      options: SIZINGS,
      description: [
        '`scale`: fits the parent and keeps the ratio; `fixed`: canvas size in px;',
        '`fill`: stretches to the parent, which needs a height.',
        '`fill` is not supported with `thumbnail`.',
        'With `fill` the story puts the editor into a dashed box; drag its corner to resize it',
      ].join(' '),
      table: {defaultValue: {summary: 'scale'}},
    },
    forceLayout: {
      control: {
        type: 'select',
        labels: {null: 'auto'},
      },
      options: LAYOUTS,
      description: [
        'Pins the layout.',
        '`auto` (`null`) picks mobile under `Breakpoints.Handset` (Viewport toolbar)',
        'or for a narrow `fill` parent, else desktop',
      ].join(' '),
    },
    weekDays: {
      control: 'object',
      description: [
        'Days in display order with their labels; the first entry is the first column (the first row on mobile).',
        'Labels are plain text: translate them in the app',
      ].join(' '),
    },
    valueChange: outputArgType('valueChange', 'Emits the new value after a drag'),
  },
  args: {
    value: SAMPLE_VALUE,
    mode: NDWU_SCHEDULE_EDITOR_MODE.FULL,
    sizing: NDWU_SCHEDULE_EDITOR_SIZING.SCALE,
    forceLayout: null,
    weekDays: NDWU_DEFAULT_WEEK_DAYS,
  },
  render: (args) => ({
    props: args,
    template: `<ndwu-schedule-editor ${argsToTemplate(args)} />`,
  }),
};

export default meta;

export const Default: Story = {
  decorators: [withControlledArgs('valueChange', (value) => ({value})), withFillLayout],
  parameters: {
    docs: {
      description: {
        story: [
          'Drag over the grid to add time; start on a filled slot to remove it.',
          'On this story\'s own page the story writes `valueChange` back into `value`, as an app does;',
          'on the docs page a drag stays until you change a control, which remounts the story from the `value` arg.',
          'With `forceLayout` `auto`, switch the Viewport toolbar to a mobile size to get the mobile layout.',
        ].join(' '),
      },
      source: {
        transform: editorSourceTransform,
      },
    },
  },
  render: (args) => {
    const schedule = signal(args.value);

    return {
      props: {
        ...args,
        schedule,
        onValueChange: (value: NdwuScheduleValue) => {
          schedule.set(value);
          args.valueChange?.(value);
        },
      },
      template: [
        `<ndwu-schedule-editor ${argsToTemplate(args, {exclude: ['value', 'valueChange']})}`,
        '[value]="schedule()"',
        '(valueChange)="onValueChange($event)" />',
      ].join(' '),
    };
  },
};

export const FullDesktop: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'Full mode, desktop layout, Monday first.',
      },
    },
  },
  render: () => ({
    template: `<ndwu-schedule-editor forceLayout="desktop" mode="full" [value]="${SAMPLE_VALUE_LITERAL}" />`,
  }),
};

export const FullDesktopSundayFirst: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: '`weekDays` sets the order of the days: here the week starts on Sunday.',
      },
    },
  },
  render: () => ({
    template: `<ndwu-schedule-editor
  forceLayout="desktop"
  mode="full"
  [weekDays]="${weekDaysLiteral(SUNDAY_FIRST_WEEK_DAYS)}"
  [value]="${SAMPLE_VALUE_LITERAL}"
/>`,
  }),
};

export const FullMobile: Story = {
  globals: {
    viewport: {value: 'mobile2', isRotated: false},
  },
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: [
          '`forceLayout="mobile"` pins the mobile layout at any width;',
          'the story opens in the Large mobile viewport.',
          'Without `forceLayout` the editor switches to mobile under `Breakpoints.Handset`:',
          'try `Default` with `forceLayout` `auto` and the Viewport toolbar.',
          'The viewport does not apply on the docs page.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<ndwu-schedule-editor forceLayout="mobile" mode="full" [value]="${SAMPLE_VALUE_LITERAL}" />`,
  }),
};

export const Thumbnail: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: 'Thumbnail mode: a small read-only preview for lists and cards.',
      },
    },
  },
  render: () => ({
    template: `<ndwu-schedule-editor forceLayout="desktop" mode="thumbnail" [value]="${SAMPLE_VALUE_LITERAL}" />`,
  }),
};

export const ScheduleActions: Story = {
  parameters: {
    ...FIXED_STORY_PARAMETERS,
    docs: {
      description: {
        story: [
          '`ndwuScheduleValueToActions(value, weekDays)` from `@ndw-ui-kit/core/schedule-actions`',
          'turns the editor value into V1 schedule actions: one `start` and one `stop` entry per time,',
          'with `hour`, `min` and `dow` (a day list, `0` = Sunday; `*` = every day).',
          'Pass the same `weekDays` as the editor: only those days are converted.',
          '`ndwuActionsToScheduleValue(actions, weekDays)` turns actions back into a value.',
          'The story keeps the value in a `schedule` signal and shows',
          '`actions = computed(() => ndwuScheduleValueToActions(schedule(), NDWU_DEFAULT_WEEK_DAYS))`;',
          'a drag updates the JSON, on the docs page too.',
        ].join(' '),
      },
    },
  },
  decorators: [...withValueOutput('actions()'), withStackLayout],
  render: () => {
    const schedule = signal(SAMPLE_VALUE);

    return {
      props: {
        schedule,
        actions: computed(() => ndwuScheduleValueToActions(schedule(), NDWU_DEFAULT_WEEK_DAYS)),
      },
      template: `<ndwu-schedule-editor
  forceLayout="desktop"
  mode="full"
  [value]="schedule()"
  (valueChange)="schedule.set($event)"
/>`,
    };
  },
};
