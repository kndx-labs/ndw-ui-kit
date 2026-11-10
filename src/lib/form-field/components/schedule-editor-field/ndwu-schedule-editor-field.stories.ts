import {JsonPipe} from '@angular/common';
import {NdwuScheduleEditorFieldComponent} from '@ndw-ui-kit/core/form-field';
import {
  NDWU_DEFAULT_WEEK_DAYS,
  NDWU_SCHEDULE_EDITOR_LAYOUT,
  NDWU_SCHEDULE_EDITOR_MODE,
  NDWU_SCHEDULE_EDITOR_SIZING,
  NdwuScheduleInterval,
  NdwuScheduleValue,
} from '@ndw-ui-kit/core/widgets';
import {Meta, StoryObj, argsToTemplate, moduleMetadata} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {storyFormControl, withFormControl} from '@sb/helpers/story-form-control';
import {withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type Story = StoryObj<NdwuScheduleEditorFieldComponent>;

const MODES = Object.values(NDWU_SCHEDULE_EDITOR_MODE);
const FIELD_SIZINGS = [NDWU_SCHEDULE_EDITOR_SIZING.SCALE, NDWU_SCHEDULE_EDITOR_SIZING.FIXED];
const LAYOUTS = [null, ...Object.values(NDWU_SCHEDULE_EDITOR_LAYOUT)];
const WORKDAY: NdwuScheduleInterval[] = [[540, 1080]];

const SAMPLE_VALUE: NdwuScheduleValue = {
  mon: WORKDAY,
  tue: WORKDAY,
  wed: WORKDAY,
  thu: WORKDAY,
  fri: WORKDAY,
};

const meta: Meta<NdwuScheduleEditorFieldComponent> = {
  title: 'Form Field/Schedule Editor Field',
  component: NdwuScheduleEditorFieldComponent,
  tags: ['autodocs'],
  decorators: [withFormControl, moduleMetadata({imports: [JsonPipe]}), withStackLayout],
  parameters: {
    docs: {
      description: {
        component:
          '`ndwu-schedule-editor` as a form control: bind it with `formControl` or `formControlName`, the control holds the `NdwuScheduleValue`. The inputs are those of [Widgets/Schedule Editor](?path=/docs/widgets-schedule-editor--docs).',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: MODES,
      description: '`full`: grid with hours and day labels that takes drags; `thumbnail`: small read-only preview',
    },
    sizing: {
      control: 'select',
      options: FIELD_SIZINGS,
      description:
        '`scale`: fits the parent and keeps the ratio; `fixed`: canvas size in px. `fill` needs a parent with a height, see [Widgets/Schedule Editor](?path=/docs/widgets-schedule-editor--docs)',
    },
    forceLayout: {
      control: {
        type: 'select',
        labels: {null: 'auto'},
      },
      options: LAYOUTS,
      description:
        'Pins the layout. `auto` (`null`) picks mobile under `Breakpoints.Handset` (Viewport toolbar), else desktop',
    },
    weekDays: {
      control: 'object',
      description: 'Days in display order with their labels. Labels are plain text: translate them in the app',
    },
  },
  args: {
    mode: NDWU_SCHEDULE_EDITOR_MODE.FULL,
    sizing: NDWU_SCHEDULE_EDITOR_SIZING.SCALE,
    forceLayout: null,
    weekDays: NDWU_DEFAULT_WEEK_DAYS,
  },
  render: (args, {id}) => ({
    props: {
      ...args,
      control: storyFormControl(id, {value: SAMPLE_VALUE}),
    },
    template: lines([
      `<ndwu-schedule-editor-field [formControl]="control" ${argsToTemplate(args)} />`,
      '<pre>{{ control.value | json }}</pre>',
    ]),
  }),
};

export default meta;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The control is `new FormControl(value)`; the JSON below is `control.value`, updated after each drag. The field takes no disabled or error state from the control.',
      },
    },
  },
};
