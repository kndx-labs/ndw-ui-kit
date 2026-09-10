import {type Meta, type StoryObj, moduleMetadata} from '@storybook/angular';
import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {expect, fn, userEvent, within} from 'storybook/test';
import {
  BUTTON_VARIANT,
  type ButtonVariant,
  ICON_NAME,
  type IconName,
  NdwuButtonComponent,
  SIZE,
  type Size,
} from '@ndw-ui-kit/core';

interface ButtonArgs {
  label: string;
  variant: ButtonVariant;
  size: Size;
  icon: IconName | null;
  disabled: boolean;
  loading: boolean;
  clicked: () => void;
}

@Component({
  selector: 'app-button-story-host',
  standalone: true,
  imports: [NdwuButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      ndwuButton
      [label]="label()"
      [variant]="variant()"
      [size]="size()"
      [icon]="icon()"
      [disabled]="disabled()"
      [loading]="loading()"
      (click)="clicked.emit($event)"
    >
    </button>
  `,
})
class ButtonStoryHostComponent {
  public readonly label = input.required<string>();
  public readonly variant = input.required<ButtonVariant>();
  public readonly size = input.required<Size>();
  public readonly icon = input<IconName | null>(null);
  public readonly disabled = input(false);
  public readonly loading = input(false);
  public readonly clicked = output<MouseEvent>();
}

// Curated subset of icons for the `icon` control. This keeps the Controls
// panel usable — it is not meant to be a catalog of every icon in the kit.
// HTML <select> options must be strings, so `none` stands in for `null` and
// is translated back via `mapping` below (Storybook's documented pattern for
// non-primitive/null option values: https://storybook.js.org/docs/api/arg-types#mapping).
const ICON_CONTROL_MAPPING: Record<string, IconName | null> = {
  none: null,
  eyeOnS: ICON_NAME.EYE_ON_S,
  searchS: ICON_NAME.SEARCH_S,
  closeS: ICON_NAME.CLOSE_S,
  plusS: ICON_NAME.PLUS_S,
  settingsS: ICON_NAME.SETTINGS_S,
  checkS: ICON_NAME.CHECK_S,
};

const ICON_CONTROL_LABELS: Record<string, string> = {
  none: 'None',
  eyeOnS: 'Eye (on)',
  searchS: 'Search',
  closeS: 'Close',
  plusS: 'Plus',
  settingsS: 'Settings',
  checkS: 'Check',
};

const meta: Meta<ButtonArgs> = {
  title: 'Core/Button',
  tags: ['autodocs'],
  component: ButtonStoryHostComponent,
  decorators: [moduleMetadata({imports: [NdwuButtonComponent]})],
  args: {
    label: 'Save changes',
    variant: BUTTON_VARIANT.PRIMARY,
    size: SIZE.XL,
    icon: null,
    disabled: false,
    loading: false,
    clicked: fn(),
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible button text.',
      table: {defaultValue: {summary: 'Save changes'}},
    },
    variant: {
      control: 'select',
      options: Object.values(BUTTON_VARIANT),
      description: 'Visual style of the button.',
      table: {defaultValue: {summary: BUTTON_VARIANT.PRIMARY}},
    },
    size: {
      control: 'select',
      options: Object.values(SIZE),
      description: 'Button size, applied via `NdwuSizeDirective`.',
      table: {defaultValue: {summary: SIZE.XL}},
    },
    icon: {
      control: {type: 'select', labels: ICON_CONTROL_LABELS},
      options: Object.keys(ICON_CONTROL_MAPPING),
      mapping: ICON_CONTROL_MAPPING,
      description: [
        'Optional leading icon (curated subset for this control;',
        'the component accepts any `IconName`). Hidden while `loading` is true.',
      ].join(' '),
      table: {defaultValue: {summary: 'null'}},
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the native button and prevents clicks.',
      table: {defaultValue: {summary: 'false'}},
    },
    loading: {
      control: 'boolean',
      description: [
        'Shows a spinner in place of the icon and suppresses',
        'pointer events via CSS (`pointer-events: none`). This is not the',
        'same as the native `disabled` attribute — the button remains',
        'focusable and is not marked disabled to assistive tech.',
      ].join(' '),
      table: {defaultValue: {summary: 'false'}},
    },
    clicked: {
      table: {disable: true},
    },
  },
};

export default meta;

type Story = StoryObj<ButtonArgs>;

export const Default: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const clicked = args.clicked as ReturnType<typeof fn>;

    clicked.mockClear();
    await userEvent.click(canvas.getByRole('button', {name: args.label}));
    await expect(clicked).toHaveBeenCalledTimes(1);
  },
};

export const Variants: Story = {
  argTypes: {
    variant: {table: {disable: true}},
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="storybook-row">
        ${
      Object.values(BUTTON_VARIANT).map((variant) => `
          <button
            ndwuButton
            [variant]="'${variant}'"
            [size]="size"
            [icon]="icon"
            [disabled]="disabled"
            [loading]="loading"
            label="${variant}"
          ></button>
        `)
        .join('')
    }
      </div>
    `,
  }),
};

export const Sizes: Story = {
  argTypes: {
    size: {table: {disable: true}},
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="storybook-row">
        ${
      Object.values(SIZE).map((size) => `
          <button
            ndwuButton
            [variant]="variant"
            [size]="'${size}'"
            [icon]="icon"
            [disabled]="disabled"
            [loading]="loading"
            label="${size}"
          ></button>
        `)
        .join('')
    }
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  args: {icon: ICON_NAME.EYE_ON_S, label: 'Preview'},
};

export const Disabled: Story = {
  args: {disabled: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const clicked = args.clicked as ReturnType<typeof fn>;

    clicked.mockClear();

    const button = canvas.getByRole('button', {name: args.label});

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(clicked).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: {loading: true, icon: ICON_NAME.SETTINGS_S},
  parameters: {
    docs: {
      description: {
        story: [
          'While `loading` is true, the icon is replaced by a spinner',
          'and clicks are suppressed via `pointer-events: none` on the host.',
          'This is a visual/interaction affordance only — the button is not',
          'given the native `disabled` attribute, so it remains focusable.',
        ].join(' '),
      },
    },
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const clicked = args.clicked as ReturnType<typeof fn>;

    clicked.mockClear();

    // Loader is present in place of the icon.
    await expect(canvasElement.querySelector('ndwu-spokes-loader')).toBeInTheDocument();
    await expect(canvasElement.querySelector('.ndwu-button__icon')).not.toBeInTheDocument();

    // Pointer events are suppressed, so we deliberately do not click through
    // the loading state here (it would not reflect real user-reachable
    // interaction and could be flaky across browsers).
    const button = canvas.getByRole('button', {name: args.label});

    await expect(button).toHaveClass('ndwu-button--loading');
  },
};
