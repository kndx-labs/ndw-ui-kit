import {NDWU_ICON_NAME, NdwuLinkComponent} from '@ndw-ui-kit/core';
import {Meta, StoryObj, argsToTemplate} from '@storybook/angular';
import {argsSourceTransform} from '@sb/helpers/args-to-source';
import {eventArgType, iconArgType} from '@sb/helpers/arg-types';
import {withRouter} from '@sb/helpers/story-router';
import {withRowLayout, withStackLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type LinkStoryArgs = NdwuLinkComponent & {
  content: string;
  click: (event: MouseEvent) => void;
};

type Story = StoryObj<LinkStoryArgs>;

const FIXED_STORY_PARAMETERS = {controls: {disable: true}};

const meta: Meta<LinkStoryArgs> = {
  title: 'Core/Link',
  component: NdwuLinkComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Anchor link with disabled and external states. Consumers can add `RouterLink` to the same anchor.',
      },
      source: {
        transform: argsSourceTransform,
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables navigation, including `RouterLink`, and blocks consumer `(click)` handlers',
    },
    external: {
      control: 'boolean',
      description: 'Shows the external-link icon',
    },
    icon: {
      ...iconArgType,
      description: 'Icon shown when `external` is true',
    },
    target: {
      control: 'text',
      description: 'Anchor target',
    },
    rel: {
      control: 'text',
      description: 'Overrides the default `rel`; `_blank` gets `noopener noreferrer` when `rel` is unset',
    },
    content: {
      control: 'text',
      description: 'Projected link text',
      table: {category: 'story'},
    },
    click: eventArgType('click', 'Native click event'),
  },
  args: {
    disabled: false,
    external: false,
    icon: NDWU_ICON_NAME.EXTERNAL_LINK_S,
    target: null,
    rel: null,
    content: 'Link',
  },
  render: (args) => {
    const argsStr = argsToTemplate(args, {exclude: ['content']});

    return {
      props: args,
      template: `
        <a
          ndwu-link
          href="#storybook-link"
          ${argsStr}
        >
          {{ content }}
        </a>`,
    };
  },
};

export default meta;

export const Default: Story = {};

export const External: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  render: () => {
    return {
      template: `
        <a
          ndwu-link
          href="https://example.com"
          [external]="true"
          target="_blank"
        >
          External link
        </a>`,
    };
  },
};

export const Disabled: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withRowLayout],
  render: () => {
    return {
      template: lines([
        `<a
          ndwu-link
          href="#storybook-disabled"
          [disabled]="true"
        >
          Disabled link
        </a>`,
        `<a
          ndwu-link
          href="#storybook-disabled-external"
          [external]="true"
          [disabled]="true"
        >
          Disabled external link
        </a>`,
      ]),
    };
  },
};

export const WithRouterLink: Story = {
  parameters: FIXED_STORY_PARAMETERS,
  decorators: [withStackLayout, ...withRouter],
  render: () => {
    return {
      template: lines([
        `<a
          ndwu-link
          routerLink="/settings"
        >
          String path
        </a>`,
        `<a
          ndwu-link
          [routerLink]="['/settings', 'network']"
        >
          Array path
        </a>`,
        `<a
          ndwu-link
          routerLink="/settings/disabled"
          [disabled]="true"
        >
          Disabled
        </a>`,
      ]),
    };
  },
};
