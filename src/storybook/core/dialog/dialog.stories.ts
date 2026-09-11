import {type Meta, type StoryObj, applicationConfig, moduleMetadata} from '@storybook/angular';
import {expect, userEvent, within} from 'storybook/test';
import {BUTTON_VARIANT, type ButtonVariant} from '@ndw-ui-kit/core';
import {DialogStoryComponent, dialogProviders} from './dialog-story.component';

interface DialogArgs {
  title: string;
  description: string | null;
  width: string;
  hasCloseButton: boolean;
  disableClose: boolean;
  isLoading: boolean;
  confirmLabel: string;
  confirmVariant: ButtonVariant;
  cancelLabel: string | null;
}

const meta: Meta<DialogArgs> = {
  title: 'Core/Dialog',
  component: DialogStoryComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({providers: dialogProviders}),
    moduleMetadata({imports: [DialogStoryComponent]}),
  ],
  args: {
    title: 'Dialog title',
    description: null,
    width: '480px',
    hasCloseButton: true,
    disableClose: false,
    isLoading: false,
    confirmLabel: 'OK',
    confirmVariant: 'primary',
    cancelLabel: null,
  },
  argTypes: {
    title: {control: 'text', description: 'Dialog header title.'},
    description: {control: 'text', description: 'Optional description below the title.'},
    width: {control: 'text', description: 'CSS width of the dialog panel.'},
    hasCloseButton: {control: 'boolean', description: 'Show the close (×) button in the header.'},
    disableClose: {control: 'boolean', description: 'Prevent closing via backdrop click, Escape, or the close button.'},
    isLoading: {control: 'boolean', description: 'Show loading overlay inside the dialog.'},
    confirmLabel: {control: 'text', description: 'Label of the primary action button.'},
    confirmVariant: {
      control: 'select',
      options: Object.values(BUTTON_VARIANT),
      description: 'Variant of the primary action button.',
    },
    cancelLabel: {control: 'text', description: 'Label of the secondary cancel button. Omit to hide it.'},
  },
  render: (args) => ({
    props: args,
    template: `<app-dialog-story [title]="title" [description]="description"
      [width]="width" [hasCloseButton]="hasCloseButton" [disableClose]="disableClose"
      [isLoading]="isLoading" [confirmLabel]="confirmLabel" [confirmVariant]="confirmVariant"
      [cancelLabel]="cancelLabel" />`,
  }),
};

export default meta;

type Story = StoryObj<DialogArgs>;

async function openDialog(canvasElement: HTMLElement): Promise<void> {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('button', {name: 'Open dialog'}));
  await new Promise((r) => setTimeout(r, 300));
}

function getDialog(): HTMLElement | null {
  return document.querySelector('[role="dialog"]');
}

export const Default: Story = {
  play: async ({canvasElement}) => {
    await openDialog(canvasElement);

    const dialog = getDialog();

    await expect(dialog).not.toBeNull();
    await expect(dialog!.querySelector('.ndwu-dialog__title')).toHaveTextContent('Dialog title');
  },
};

export const WithDescription: Story = {
  args: {
    title: 'Confirm action',
    description: 'Are you sure you want to proceed? This cannot be undone.',
    confirmLabel: 'Confirm',
    confirmVariant: 'secondary-negative',
    cancelLabel: 'Cancel',
  },
};

export const WithoutCloseButton: Story = {
  args: {
    title: 'Terms of service',
    description: 'Please review and accept the terms to continue.',
    hasCloseButton: false,
    confirmLabel: 'Accept',
    cancelLabel: 'Decline',
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading data',
    description: 'Please wait while we fetch your data.',
    isLoading: true,
    confirmLabel: 'Close',
  },
  play: async ({canvasElement}) => {
    await openDialog(canvasElement);

    const dialog = getDialog();

    await expect(dialog).not.toBeNull();
    await expect(dialog!.getAttribute('aria-busy')).toBe('true');
    await expect(dialog!.querySelector('.ndwu-dialog__loader')).not.toBeNull();
  },
};

export const DisableClose: Story = {
  args: {
    title: 'Processing',
    description: 'Please wait, closing is disabled.',
    disableClose: true,
    hasCloseButton: true,
    confirmLabel: 'Done',
  },
};

export const WideDialog: Story = {
  args: {
    title: 'Wide dialog',
    description: 'This dialog uses a wider panel for content-heavy layouts.',
    width: '720px',
    confirmLabel: 'Got it',
    cancelLabel: 'Cancel',
  },
};
