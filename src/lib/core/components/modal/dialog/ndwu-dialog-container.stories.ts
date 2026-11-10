import {
  NDWU_DIALOG_CONFIG_DEFAULTS,
  NDWU_SIZE,
  NdwuAlertModalConfig,
  NdwuButtonComponent,
  NdwuConfirmModalConfig,
  NdwuDialogConfig,
  NdwuDialogContainerComponent,
  NdwuModalActionsDirective,
  NdwuModalBodyDirective,
  NdwuModalButton,
  NdwuModalContentComponent,
  NdwuModalFooterDirective,
  NdwuModalHeaderDirective,
  NdwuModalRef,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, moduleMetadata} from '@storybook/angular';
import {expect, screen, waitFor} from 'storybook/test';
import {SbModalCustomSlotsComponent} from '@sb/demos/modal-custom-slots.component';
import {SbModalFormComponent} from '@sb/demos/modal-form.component';
import {SbModalGrowingComponent} from '@sb/demos/modal-growing.component';
import {SbModalInitialFocusComponent} from '@sb/demos/modal-initial-focus.component';
import {SbModalLongTextComponent} from '@sb/demos/modal-long-text.component';
import {SbModalOpenFn} from '@sb/helpers/modal-opener.component';
import {
  AfterClosedArg,
  afterClosedArgType,
  modalOpener,
  modalSource,
  modalSources,
  modalStoryParameters,
  objectSource,
  withModalOpener,
} from '@sb/helpers/story-modal';
import {withRowLayout} from '@sb/helpers/story-layout';
import {lines} from '@sb/helpers/story-template';

type DialogStoryArgs = NdwuDialogConfig & AfterClosedArg;

type Story = StoryObj<DialogStoryArgs>;

const FIELD_SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const CLOSE_BUTTON: NdwuModalButton = {label: 'Close', variant: 'primary'};
const OK_BUTTON: NdwuModalButton = {label: 'OK', variant: 'primary'};
const AUTO_FOCUS_OPTIONS = [true, false, 'dialog', 'first-tabbable', 'first-heading'];
const DELAY_MS = 2000;

const openDialogWith = (content: NdwuModalContentComponent, config: NdwuDialogConfig): SbModalOpenFn => {
  return ({modal, injector}) => modal.openDialog(content, {...config, injector});
};

const dialogConfig = (args: DialogStoryArgs): NdwuDialogConfig => {
  return Object.fromEntries(
    Object.entries(args).filter(([key, value]) => key !== 'afterClosed' && value !== '' && value !== undefined),
  );
};

const changedConfig = (args: DialogStoryArgs): NdwuDialogConfig => {
  const defaults = new Map<string, unknown>(Object.entries(NDWU_DIALOG_CONFIG_DEFAULTS));

  return Object.fromEntries(
    Object.entries(dialogConfig(args)).filter(([key, value]) => defaults.get(key) !== value),
  );
};

const meta: Meta<DialogStoryArgs> = {
  title: 'Core/Modal/Dialog',
  tags: ['autodocs'],
  decorators: [withModalOpener],
  parameters: {
    docs: {
      description: {
        component:
          'Modal dialog opened from code with `NdwuModalService`: `alert()`, `confirm()`, `openDialog()` with a component or `openTemplate()` with a template. The config sets the title, description, footer buttons, size and focus; `afterClosed$` emits the result. Content can replace the header and footer with `*ndwuModalHeader` / `*ndwuModalFooter`.',
      },
    },
  },
  argTypes: {
    title: {control: 'text', description: 'Title in the default header; also the accessible name'},
    description: {control: 'text', description: 'Text under the title; linked with `aria-describedby`'},
    buttons: {
      control: 'object',
      description:
        'Footer buttons: `label`, `variant`, `result` (closes with it) or `onClick(ref)` (does not close)',
    },
    width: {control: 'text', description: 'CSS width; empty = `auto`'},
    minWidth: {control: 'text', description: 'CSS min width'},
    maxWidth: {control: 'text', description: 'CSS max width; empty = `90vw`'},
    height: {control: 'text', description: 'CSS height; empty = grows with the content'},
    minHeight: {control: 'text', description: 'CSS min height'},
    maxHeight: {control: 'text', description: 'CSS max height; empty = `90vh`, then the body scrolls'},
    hasCloseButton: {control: 'boolean', description: 'Shows the close button in the header'},
    disableClose: {
      control: 'boolean',
      description: 'Escape and backdrop click do nothing; the close button is disabled',
    },
    trapFocus: {control: 'boolean', description: 'Keeps Tab inside the dialog'},
    restoreFocus: {control: 'boolean', description: 'Returns focus to the opener after closing'},
    isLoading: {control: 'boolean', description: 'Shows the spinner and sets `aria-busy`; change it with `setLoading()`'},
    autoFocus: {
      control: {type: 'select', labels: {true: 'true', false: 'false'}},
      options: AUTO_FOCUS_OPTIONS,
      description:
        'Initial focus: `first-heading` (title), `first-tabbable`, `dialog` (the dialog element), `true` (`cdkFocusInitial` element, else first tabbable), `false` (dialog element)',
    },
    closeButtonAriaLabel: {control: 'text', description: 'Accessible name of the close button'},
    ariaLabel: {
      control: 'text',
      description: 'Accessible name when there is no title (custom header or no header)',
    },
    ariaLabelledby: {control: false, description: 'Id of the element that names the dialog'},
    data: {control: false, description: 'Data for the content, injected with `NDWU_MODAL_DATA`'},
    id: {control: false, description: 'Modal id; generated when not set'},
    panelClass: {control: false, description: 'Class of the overlay pane'},
    backdropClass: {control: false, description: 'Class of the backdrop'},
    theme: {control: false, description: 'Theme of the dialog; defaults to the theme class on `body`'},
    stackingOnMobile: {
      control: false,
      description: 'How a dialog opened from another dialog animates on phones: `stack`, `replace` or `none`',
    },
    injector: {
      control: false,
      description: 'Parent injector of the content; pass a component injector to reach its providers and size',
    },
    afterClosed: afterClosedArgType,
  },
  args: {
    title: 'Dialog title',
    description: 'Text under the title.',
    buttons: [
      {label: 'Cancel', result: false},
      {label: 'OK', variant: 'primary', result: true},
    ],
    width: '',
    minWidth: '',
    maxWidth: '',
    height: '',
    minHeight: '',
    maxHeight: '',
    hasCloseButton: true,
    disableClose: false,
    trapFocus: true,
    restoreFocus: true,
    isLoading: false,
    autoFocus: 'first-heading',
    closeButtonAriaLabel: 'Close',
    ariaLabel: '',
  },
  render: (args) => ({
    props: {
      afterClosed: args.afterClosed,
      open: openDialogWith(NdwuDialogContainerComponent, dialogConfig(args)),
    },
    template: modalOpener('Open dialog', 'open'),
  }),
};

export default meta;

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        language: 'ts',
        transform: (_code: string, {args}: {args: DialogStoryArgs}) => {
          return modalSource('openDialog', changedConfig(args), 'NdwuDialogContainerComponent');
        },
      },
    },
  },
};

const ALERT_CONFIG: NdwuAlertModalConfig = {
  header: 'Operation successful',
  description: 'Your changes have been saved successfully.',
  buttonText: 'Got it',
};

const CONFIRM_CONFIG: NdwuConfirmModalConfig = {
  header: 'Delete item',
  description: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  confirmVariant: 'secondary-negative',
};

const openAlert: SbModalOpenFn = ({modal}) => modal.alert(ALERT_CONFIG);
const openConfirm: SbModalOpenFn = ({modal}) => modal.confirm(CONFIRM_CONFIG);

export const AlertAndConfirm: Story = {
  parameters: modalStoryParameters(
    modalSources(modalSource('alert', ALERT_CONFIG), modalSource('confirm', CONFIRM_CONFIG)),
    'System dialogs: `alert()` closes with `undefined`, `confirm()` with `true` or `false` (`undefined` after Escape). Their configs have no `injector`, so their buttons keep the default size.',
  ),
  decorators: [withRowLayout],
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openAlert, openConfirm},
    template: lines([modalOpener('Show alert', 'openAlert'), modalOpener('Delete item', 'openConfirm')]),
  }),
};

const FORM_TITLE = 'Contact form';

const FORM_CONFIG: NdwuDialogConfig = {
  title: FORM_TITLE,
  description: 'Enter your contact information below.',
  autoFocus: true,
};

const FORM_SOURCE = modalSource('openDialog', FORM_CONFIG, 'ContactFormComponent');

const openForm = openDialogWith(SbModalFormComponent, FORM_CONFIG);

export const WithForm: Story = {
  parameters: {
    ...modalStoryParameters(
      FORM_SOURCE,
      'The content component injects `NDWU_MODAL_REF`, puts its button into `*ndwuModalFooter` and closes with the form value. Content code: `.storybook/demos/modal-form.component.ts`.',
    ),
    sizes: FIELD_SIZES,
  },
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openForm},
    template: modalOpener('Open form dialog', 'openForm'),
  }),
};

const SLOTS_TEMPLATE = `<ng-template #slotsDialog let-modalRef="modalRef">
  <section *ndwuModalHeader>
    <h3>Template header</h3>
    <button ndwu-button variant="secondary" label="Dismiss" (click)="modalRef.close()"></button>
  </section>

  <div ndwuModalBody>
    <p>Opened with openTemplate(); the template uses *ndwuModalHeader, ndwuModalBody and *ndwuModalFooter.</p>
  </div>

  <div *ndwuModalFooter ndwuModalActions>
    <button ndwu-button variant="primary" label="Close template dialog" (click)="modalRef.close()"></button>
  </div>
</ng-template>`;

const SCROLLABLE_TEMPLATE = `<ng-template #scrollableDialog let-modalRef="modalRef">
  <div ndwuModalBody>
    <sb-modal-long-text />
  </div>

  <div *ndwuModalFooter ndwuModalActions>
    <button ndwu-button variant="secondary" label="Close" (click)="modalRef.close(false)"></button>
    <button ndwu-button variant="primary" label="Confirm" (click)="modalRef.close(true)"></button>
  </div>
</ng-template>`;

const SLOTS_CONFIG: NdwuDialogConfig = {
  ariaLabel: 'Template dialog',
  autoFocus: 'first-tabbable',
  hasCloseButton: false,
  width: '560px',
};

const SCROLLABLE_TEMPLATE_CONFIG: NdwuDialogConfig = {
  title: 'Template dialog with custom footer',
  description: 'Scrollable content rendered from an ng-template with footer actions defined in the same template.',
  autoFocus: 'first-tabbable',
  width: '80vw',
  maxWidth: '960px',
  height: '80vh',
};

const openTemplateWith = (config: NdwuDialogConfig): SbModalOpenFn => {
  return ({modal, injector, viewContainerRef, template}) => {
    if (template === null) {
      throw new Error('sb-modal-opener: bind [template] to open a template dialog');
    }

    return modal.openTemplate(template, {type: 'dialog', viewContainerRef, config: {...config, injector}});
  };
};

const openSlots = openTemplateWith(SLOTS_CONFIG);
const openScrollableTemplate = openTemplateWith(SCROLLABLE_TEMPLATE_CONFIG);

const TEMPLATE_API_SOURCE = `@Component({
  imports: [
    NdwuButtonComponent,
    NdwuModalActionsDirective,
    NdwuModalBodyDirective,
    NdwuModalFooterDirective,
    NdwuModalHeaderDirective,
  ],
  template: \`
${SLOTS_TEMPLATE}

${SCROLLABLE_TEMPLATE}

<button ndwu-button label="Open template dialog" (click)="openSlots()"></button>
<button ndwu-button label="Open scrollable template dialog" (click)="openScrollable()"></button>
\`,
})
export class TemplateDialogExampleComponent {
  private readonly modalService = inject(NdwuModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly slotsDialog = viewChild.required<TemplateRef<NdwuModalTemplateContext>>('slotsDialog');
  private readonly scrollableDialog = viewChild.required<TemplateRef<NdwuModalTemplateContext>>('scrollableDialog');

  protected openSlots(): void {
    this.modalService.openTemplate(this.slotsDialog(), {
      type: 'dialog',
      viewContainerRef: this.viewContainerRef,
      config: ${objectSource(SLOTS_CONFIG, 3)},
    });
  }

  protected openScrollable(): void {
    this.modalService.openTemplate(this.scrollableDialog(), {
      type: 'dialog',
      viewContainerRef: this.viewContainerRef,
      config: ${objectSource(SCROLLABLE_TEMPLATE_CONFIG, 3)},
    });
  }
}`;

export const TemplateApi: Story = {
  parameters: modalStoryParameters(
    TEMPLATE_API_SOURCE,
    '`openTemplate()` renders an `ng-template` in the dialog; the context gives `modalRef` and `data`. Slot directives work inside the template. The template needs `viewContainerRef`. `sb-modal-long-text` stands for your long content. Without a `title`, set `ariaLabel`.',
  ),
  decorators: [
    withRowLayout,
    moduleMetadata({
      imports: [
        NdwuButtonComponent,
        NdwuModalActionsDirective,
        NdwuModalBodyDirective,
        NdwuModalFooterDirective,
        NdwuModalHeaderDirective,
        SbModalLongTextComponent,
      ],
    }),
  ],
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openSlots, openScrollableTemplate},
    template: lines([
      SLOTS_TEMPLATE,
      SCROLLABLE_TEMPLATE,
      modalOpener('Open template dialog', 'openSlots', 'slotsDialog'),
      modalOpener('Open scrollable template dialog', 'openScrollableTemplate', 'scrollableDialog'),
    ]),
  }),
};

const CUSTOM_SLOTS_CONFIG: NdwuDialogConfig = {
  ariaLabel: 'Dialog with custom header and footer slots',
  autoFocus: 'first-heading',
  hasCloseButton: false,
  width: '560px',
};

const openCustomSlots = openDialogWith(SbModalCustomSlotsComponent, CUSTOM_SLOTS_CONFIG);

export const ComponentSlots: Story = {
  parameters: modalStoryParameters(
    modalSource('openDialog', CUSTOM_SLOTS_CONFIG, 'CustomSlotsComponent'),
    '`*ndwuModalHeader` and `*ndwuModalFooter` in the content render in the container header and footer, outside the scrolling body. Set `ariaLabel` (or `ariaLabelledby`) when the default title is replaced. Closes with `true` (Save) or `false`. Content code: `.storybook/demos/modal-custom-slots.component.ts`.',
  ),
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openCustomSlots},
    template: modalOpener('Open dialog with custom slots', 'openCustomSlots'),
  }),
};

const USERS = [
  {id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin'},
  {id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor'},
  {id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer'},
];

const RESULT_CONFIG: NdwuDialogConfig = {
  title: 'Select a user',
  description: 'Click on a user to select them.',
  width: '500px',
  buttons: USERS.map((user) => ({label: user.name, result: user})),
};

const openResult = openDialogWith(NdwuDialogContainerComponent, RESULT_CONFIG);

export const ReturningResult: Story = {
  parameters: modalStoryParameters(
    modalSource('openDialog', RESULT_CONFIG, 'NdwuDialogContainerComponent'),
    'A footer button with `result` closes the dialog with that value; `afterClosed$` emits it.',
  ),
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openResult},
    template: modalOpener('Select a user', 'openResult'),
  }),
};

const SCROLLABLE_CONFIG: NdwuDialogConfig = {
  title: 'Some long text',
  width: '80vw',
  buttons: [OK_BUTTON],
};

const openScrollable = openDialogWith(SbModalLongTextComponent, SCROLLABLE_CONFIG);

export const Scrollable: Story = {
  parameters: modalStoryParameters(
    modalSource('openDialog', SCROLLABLE_CONFIG, 'LongTextComponent'),
    'Content taller than `maxHeight` (`90vh` by default) scrolls inside the body; the header and footer stay.',
  ),
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openScrollable},
    template: modalOpener('View terms', 'openScrollable'),
  }),
};

const GROWING_CONFIG: NdwuDialogConfig = {
  title: 'Auto height dialog',
  maxWidth: '520px',
  buttons: [CLOSE_BUTTON],
};

const openGrowing = openDialogWith(SbModalGrowingComponent, GROWING_CONFIG);

export const AutoHeight: Story = {
  parameters: modalStoryParameters(
    modalSource('openDialog', GROWING_CONFIG, 'GrowingContentComponent'),
    'Without `height` the dialog grows with its content up to `maxHeight`, then the body scrolls.',
  ),
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openGrowing},
    template: modalOpener('Open growing dialog', 'openGrowing'),
  }),
};

const SMALL_CONFIG: NdwuDialogConfig = {
  title: 'Small dialog',
  description: 'This is a compact dialog: 250×150px',
  width: '250px',
  height: '150px',
  buttons: [CLOSE_BUTTON],
};

const NARROW_CONFIG: NdwuDialogConfig = {
  title: 'Narrow dialog',
  description: 'Width constrained between 300px and 400px.',
  width: '300px',
  maxWidth: '400px',
  height: '200px',
  buttons: [CLOSE_BUTTON],
};

const WIDE_CONFIG: NdwuDialogConfig = {
  title: 'Wide dialog',
  description: 'This dialog takes up 80vw of the viewport width, capped at 1000px maximum.',
  width: '80vw',
  maxWidth: '1000px',
  buttons: [OK_BUTTON],
};

const openSmall = openDialogWith(NdwuDialogContainerComponent, SMALL_CONFIG);
const openNarrow = openDialogWith(NdwuDialogContainerComponent, NARROW_CONFIG);
const openWide = openDialogWith(SbModalLongTextComponent, WIDE_CONFIG);

export const Sizes: Story = {
  parameters: modalStoryParameters(
    modalSources(
      modalSource('openDialog', SMALL_CONFIG, 'NdwuDialogContainerComponent'),
      modalSource('openDialog', NARROW_CONFIG, 'NdwuDialogContainerComponent'),
      modalSource('openDialog', WIDE_CONFIG, 'LongTextComponent'),
    ),
    'Size fields take CSS lengths. On phones a dialog always takes the full screen.',
  ),
  decorators: [withRowLayout],
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openSmall, openNarrow, openWide},
    template: lines([
      modalOpener('Small', 'openSmall'),
      modalOpener('Narrow', 'openNarrow'),
      modalOpener('Wide', 'openWide'),
    ]),
  }),
};

const AUTO_FOCUS_HEADING_CONFIG: NdwuDialogConfig = {
  title: 'Auto focus',
  description: 'The dialog header received focus automatically when this dialog opened.',
  autoFocus: 'first-heading',
  buttons: [CLOSE_BUTTON],
};

const NO_FOCUS_TRAP_CONFIG: NdwuDialogConfig = {
  title: 'No focus trap',
  description: 'Focus is not trapped. You can Tab outside this dialog.',
  trapFocus: false,
  buttons: [CLOSE_BUTTON],
};

const FIRST_TABBABLE_CONFIG: NdwuDialogConfig = {
  title: 'Auto focus first tabbable',
  description: 'Focus trap is active. The first tabbable element gets focus.',
  autoFocus: 'first-tabbable',
  buttons: [CLOSE_BUTTON],
};

const INITIAL_FOCUS_CONFIG: NdwuDialogConfig = {
  title: 'Custom focus',
  description: 'Focus trap is active. The "Close" button gets focus.',
  autoFocus: true,
};

const openAutoFocusHeading = openDialogWith(NdwuDialogContainerComponent, AUTO_FOCUS_HEADING_CONFIG);
const openNoFocusTrap = openDialogWith(NdwuDialogContainerComponent, NO_FOCUS_TRAP_CONFIG);
const openFirstTabbable = openDialogWith(NdwuDialogContainerComponent, FIRST_TABBABLE_CONFIG);
const openInitialFocus = openDialogWith(SbModalInitialFocusComponent, INITIAL_FOCUS_CONFIG);

export const FocusManagement: Story = {
  parameters: modalStoryParameters(
    modalSources(
      modalSource('openDialog', AUTO_FOCUS_HEADING_CONFIG, 'NdwuDialogContainerComponent'),
      modalSource('openDialog', NO_FOCUS_TRAP_CONFIG, 'NdwuDialogContainerComponent'),
      modalSource('openDialog', FIRST_TABBABLE_CONFIG, 'NdwuDialogContainerComponent'),
      modalSource('openDialog', INITIAL_FOCUS_CONFIG, 'InitialFocusComponent'),
    ),
    '`autoFocus` picks the first focus: the title (`first-heading`, default), the first tabbable element, or with `true` the element marked `cdkFocusInitial`. `trapFocus: false` lets Tab leave the dialog. `restoreFocus` returns focus to the opener. Content code of Custom focus: `.storybook/demos/modal-initial-focus.component.ts`.',
  ),
  decorators: [withRowLayout],
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openAutoFocusHeading, openNoFocusTrap, openFirstTabbable, openInitialFocus},
    template: lines([
      modalOpener('Auto focus on header (default)', 'openAutoFocusHeading'),
      modalOpener('No focus trap', 'openNoFocusTrap'),
      modalOpener('Auto focus on first tabbable', 'openFirstTabbable'),
      modalOpener('Custom focus', 'openInitialFocus'),
    ]),
  }),
};

const LOADING_TITLE = 'Loading state';
const LOADING_DESCRIPTION = 'Click "Reload" to simulate an async operation with loading state.';

const reload = (ref: NdwuModalRef): void => {
  ref.setLoading(true);
  setTimeout(() => ref.setLoading(false), DELAY_MS);
};

const openLoading: SbModalOpenFn = ({modal, injector}) => {
  const ref = modal.openDialog(NdwuDialogContainerComponent, {
    title: LOADING_TITLE,
    description: LOADING_DESCRIPTION,
    isLoading: true,
    buttons: [
      {label: 'Close', result: null},
      {label: 'Reload', variant: 'primary', onClick: reload},
    ],
    injector,
  });

  setTimeout(() => ref.setLoading(false), DELAY_MS);

  return ref;
};

const LOADING_SOURCE = `const ref = this.modalService.openDialog(NdwuDialogContainerComponent, {
  title: '${LOADING_TITLE}',
  description: '${LOADING_DESCRIPTION}',
  isLoading: true,
  buttons: [
    {label: 'Close', result: null},
    {
      label: 'Reload',
      variant: 'primary',
      onClick: (dialogRef) => {
        dialogRef.setLoading(true);
        setTimeout(() => dialogRef.setLoading(false), ${DELAY_MS});
      },
    },
  ],
});

setTimeout(() => ref.setLoading(false), ${DELAY_MS});`;

export const LoadingState: Story = {
  parameters: modalStoryParameters(
    LOADING_SOURCE,
    '`isLoading` and `setLoading()` show the spinner and set `aria-busy`. A button with `onClick` runs it and does not close the dialog.',
  ),
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openLoading},
    template: modalOpener('Simulate async', 'openLoading'),
  }),
};

const ASYNC_CONFIG: NdwuDialogConfig = {
  title: 'Loading dialog content',
  description: 'Title and description will update in 2 seconds.',
  buttons: [CLOSE_BUTTON],
};

const ASYNC_TITLE = 'Content loaded';
const ASYNC_DESCRIPTION = 'This title and description were set asynchronously after opening.';

const openAsync: SbModalOpenFn = ({modal, injector}) => {
  const ref = modal.openDialog(NdwuDialogContainerComponent, {...ASYNC_CONFIG, injector});
  const timerId = setTimeout(() => {
    ref.setTitle(ASYNC_TITLE);
    ref.setDescription(ASYNC_DESCRIPTION);
  }, DELAY_MS);

  ref.afterClosed$.subscribe(() => clearTimeout(timerId));

  return ref;
};

const ASYNC_SOURCE = `const ref = this.modalService.openDialog(NdwuDialogContainerComponent, ${objectSource(ASYNC_CONFIG)});

const timerId = setTimeout(() => {
  ref.setTitle('${ASYNC_TITLE}');
  ref.setDescription('${ASYNC_DESCRIPTION}');
}, ${DELAY_MS});

ref.afterClosed$.subscribe(() => clearTimeout(timerId));`;

export const AsyncTitleAndDescription: Story = {
  parameters: modalStoryParameters(
    ASYNC_SOURCE,
    '`setTitle()` and `setDescription()` change the header of an open dialog, e.g. after data loads.',
  ),
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openAsync},
    template: modalOpener('Open async title/description dialog', 'openAsync'),
  }),
};

export const OpenedForAccessibility: Story = {
  ...WithForm,
  tags: ['!autodocs'],
  parameters: {
    ...modalStoryParameters(
      FORM_SOURCE,
      'Opens the form dialog in `play`, so the Accessibility panel checks it: `aria-modal`, the name from the title, focus kept inside. Not on the docs page: the dialog would cover it.',
    ),
    sizes: FIELD_SIZES,
  },
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Open form dialog'}));

    const dialog = await screen.findByRole('dialog', {name: FORM_TITLE});

    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement | null));

    await userEvent.tab({shift: true});

    await expect(dialog).toContainElement(document.activeElement as HTMLElement | null);
  },
};
