import {
  NDWU_DRAWER_CONFIG_DEFAULTS,
  NDWU_SIZE,
  NdwuButtonComponent,
  NdwuDrawerConfig,
  NdwuDrawerContainerComponent,
  NdwuModalActionsDirective,
  NdwuModalBodyDirective,
  NdwuModalButton,
  NdwuModalContentComponent,
  NdwuModalFooterDirective,
  NdwuModalHeaderDirective,
} from '@ndw-ui-kit/core';
import {Meta, StoryObj, moduleMetadata} from '@storybook/angular';
import {expect, screen, waitFor} from 'storybook/test';
import {SbModalCustomSlotsComponent} from '@sb/demos/modal-custom-slots.component';
import {SbModalFormComponent} from '@sb/demos/modal-form.component';
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

type DrawerStoryArgs = NdwuDrawerConfig & AfterClosedArg;

type Story = StoryObj<DrawerStoryArgs>;

interface TemplateExample {
  readonly ref: string;
  readonly template: string;
  readonly label: string;
  readonly method: string;
  readonly config: NdwuDrawerConfig;
}

const FIELD_SIZES = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
const DRAWER_SIZES = [NDWU_SIZE.XL, NDWU_SIZE.XXL];
const AUTO_FOCUS_OPTIONS = [true, false, 'dialog', 'first-tabbable', 'first-heading'];
const CANCEL_BUTTON: NdwuModalButton = {label: 'Cancel', result: false};
const OK_BUTTON: NdwuModalButton = {label: 'OK', variant: 'primary', result: true};
const SAVE_BUTTON: NdwuModalButton = {label: 'Save', variant: 'primary', result: true};

const openDrawerWith = (content: NdwuModalContentComponent, config: NdwuDrawerConfig): SbModalOpenFn => {
  return ({modal, injector}) => modal.openDrawer(content, {...config, injector});
};

const drawerConfig = (args: DrawerStoryArgs): NdwuDrawerConfig => {
  return Object.fromEntries(
    Object.entries(args).filter(([key, value]) => key !== 'afterClosed' && value !== '' && value !== undefined),
  );
};

const changedConfig = (args: DrawerStoryArgs): NdwuDrawerConfig => {
  const defaults = new Map<string, unknown>(Object.entries(NDWU_DRAWER_CONFIG_DEFAULTS));

  return Object.fromEntries(
    Object.entries(drawerConfig(args)).filter(([key, value]) => defaults.get(key) !== value),
  );
};

const meta: Meta<DrawerStoryArgs> = {
  title: 'Core/Modal/Drawer',
  tags: ['autodocs'],
  decorators: [withModalOpener],
  parameters: {
    docs: {
      description: {
        component:
          'Side panel that slides in from the right, opened from code with `NdwuModalService`: `openDrawer()` with a component or `openTemplate()` with `type: \'drawer\'`. `size` sets the panel width: `XL` (700px, default) or `XXL` (1200px); on phones the drawer takes the full screen. The config sets the title, description and footer buttons; `afterClosed$` emits the result. Content can replace the header and footer with `*ndwuModalHeader` / `*ndwuModalFooter`.',
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
    size: {
      control: 'select',
      options: DRAWER_SIZES,
      description:
        'Panel width: `XL` 700px (default), `XXL` 1200px. Not the size of the controls inside: they get it from `config.injector` (Size toolbar)',
    },
    hasCloseButton: {control: 'boolean', description: 'Shows the close button in the header'},
    disableClose: {
      control: 'boolean',
      description: 'Escape and backdrop click do nothing; the close button is disabled',
    },
    trapFocus: {control: 'boolean', description: 'Keeps Tab inside the drawer'},
    restoreFocus: {control: 'boolean', description: 'Returns focus to the opener after closing'},
    isLoading: {control: 'boolean', description: 'Shows the spinner and sets `aria-busy`; change it with `setLoading()`'},
    autoFocus: {
      control: {type: 'select', labels: {true: 'true', false: 'false'}},
      options: AUTO_FOCUS_OPTIONS,
      description:
        'Initial focus: `first-heading` (title), `first-tabbable`, `dialog` (the drawer element), `true` (`cdkFocusInitial` element, else first tabbable), `false` (drawer element)',
    },
    closeButtonAriaLabel: {control: 'text', description: 'Accessible name of the close button'},
    ariaLabel: {
      control: 'text',
      description: 'Accessible name when there is no title (custom header or no header)',
    },
    ariaLabelledby: {control: false, description: 'Id of the element that names the drawer'},
    data: {control: false, description: 'Data for the content, injected with `NDWU_MODAL_DATA`'},
    id: {control: false, description: 'Modal id; generated when not set'},
    panelClass: {control: false, description: 'Class of the overlay pane'},
    backdropClass: {control: false, description: 'Class of the backdrop'},
    theme: {control: false, description: 'Theme of the drawer; defaults to the theme class on `body`'},
    stackingOnMobile: {
      control: false,
      description: 'How a modal opened from another modal animates on phones: `stack`, `replace` or `none`',
    },
    injector: {
      control: false,
      description: 'Parent injector of the content; pass a component injector to reach its providers and size',
    },
    afterClosed: afterClosedArgType,
  },
  args: {
    title: 'Drawer title',
    description: 'The drawer slides in from the right.',
    buttons: [CANCEL_BUTTON, OK_BUTTON],
    size: NDWU_SIZE.XL,
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
      open: openDrawerWith(NdwuDrawerContainerComponent, drawerConfig(args)),
    },
    template: modalOpener('Open drawer', 'open'),
  }),
};

export default meta;

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        language: 'ts',
        transform: (_code: string, {args}: {args: DrawerStoryArgs}) => {
          return modalSource('openDrawer', changedConfig(args), 'NdwuDrawerContainerComponent');
        },
      },
    },
  },
};

const XL_CONFIG: NdwuDrawerConfig = {
  title: 'XL drawer (700px)',
  description: 'The default width. It slides in from the right.',
  size: NDWU_SIZE.XL,
  buttons: [CANCEL_BUTTON, OK_BUTTON],
};

const XXL_CONFIG: NdwuDrawerConfig = {
  title: 'XXL drawer (1200px)',
  description: 'Extra width for complex content.',
  size: NDWU_SIZE.XXL,
  buttons: [CANCEL_BUTTON, SAVE_BUTTON],
};

const openXl = openDrawerWith(NdwuDrawerContainerComponent, XL_CONFIG);
const openXxl = openDrawerWith(NdwuDrawerContainerComponent, XXL_CONFIG);

export const Sizes: Story = {
  parameters: modalStoryParameters(
    modalSources(
      modalSource('openDrawer', XL_CONFIG, 'NdwuDrawerContainerComponent'),
      modalSource('openDrawer', XXL_CONFIG, 'NdwuDrawerContainerComponent'),
    ),
    '`size` sets only the panel width. A screen narrower than the panel gets a full-width drawer; phones get a full-screen drawer. Cancel closes with `false`, OK and Save with `true`.',
  ),
  decorators: [withRowLayout],
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openXl, openXxl},
    template: lines([modalOpener('XL (default)', 'openXl'), modalOpener('XXL', 'openXxl')]),
  }),
};

const FORM_TITLE = 'Drawer with form';

const FORM_CONFIG: NdwuDrawerConfig = {title: FORM_TITLE};

const FORM_SOURCE = modalSource('openDrawer', FORM_CONFIG, 'ContactFormComponent');

const openForm = openDrawerWith(SbModalFormComponent, FORM_CONFIG);

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
    template: modalOpener('Open form drawer', 'openForm'),
  }),
};

const SCROLLABLE_CONFIG: NdwuDrawerConfig = {
  title: 'Scrollable content',
  buttons: [OK_BUTTON],
};

const openScrollable = openDrawerWith(SbModalLongTextComponent, SCROLLABLE_CONFIG);

export const Scrollable: Story = {
  parameters: modalStoryParameters(
    modalSource('openDrawer', SCROLLABLE_CONFIG, 'LongTextComponent'),
    'The drawer is as tall as the screen; longer content scrolls inside the body while the header and footer stay.',
  ),
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openScrollable},
    template: modalOpener('Open drawer with scrollable content', 'openScrollable'),
  }),
};

const CUSTOM_SLOTS_CONFIG: NdwuDrawerConfig = {
  ariaLabel: 'Drawer with custom header and footer slots',
  autoFocus: 'first-heading',
  hasCloseButton: false,
};

const openCustomSlots = openDrawerWith(SbModalCustomSlotsComponent, CUSTOM_SLOTS_CONFIG);

export const ComponentSlots: Story = {
  parameters: modalStoryParameters(
    modalSource('openDrawer', CUSTOM_SLOTS_CONFIG, 'CustomSlotsComponent'),
    '`*ndwuModalHeader` and `*ndwuModalFooter` in the content render in the drawer header and footer, outside the scrolling body. Set `ariaLabel` (or `ariaLabelledby`) when the default title is replaced. Closes with `true` (Save) or `false`. Content code: `.storybook/demos/modal-custom-slots.component.ts`.',
  ),
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openCustomSlots},
    template: modalOpener('Open drawer with custom slots', 'openCustomSlots'),
  }),
};

const openTemplateDrawerWith = (config: NdwuDrawerConfig): SbModalOpenFn => {
  return ({modal, injector, viewContainerRef, template}) => {
    if (template === null) {
      throw new Error('sb-modal-opener: bind [template] to open a template drawer');
    }

    return modal.openTemplate(template, {type: 'drawer', viewContainerRef, config: {...config, injector}});
  };
};

const templateExampleSource = (
  name: string,
  imports: readonly string[],
  examples: readonly TemplateExample[],
): string => {
  const importLines = imports.map((item) => `    ${item},`).join('\n');
  const templates = examples.map((example) => example.template).join('\n\n');
  const buttons = examples
    .map((example) => `<button ndwu-button label="${example.label}" (click)="${example.method}()"></button>`)
    .join('\n');
  const queries = examples
    .map((example) => {
      return `  private readonly ${example.ref} = viewChild.required<TemplateRef<NdwuModalTemplateContext>>('${example.ref}');`;
    })
    .join('\n');
  const methods = examples
    .map((example) => {
      return `  protected ${example.method}(): void {
    this.modalService.openTemplate(this.${example.ref}(), {
      type: 'drawer',
      viewContainerRef: this.viewContainerRef,
      config: ${objectSource(example.config, 3)},
    });
  }`;
    })
    .join('\n\n');

  return `@Component({
  imports: [
${importLines}
  ],
  template: \`
${templates}

${buttons}
\`,
})
export class ${name} {
  private readonly modalService = inject(NdwuModalService);
  private readonly viewContainerRef = inject(ViewContainerRef);
${queries}

${methods}
}`;
};

const TEMPLATE_DRAWER = `<ng-template #templateDrawer let-modalRef="modalRef">
  <div ndwuModalBody>
    <p>This drawer was opened with <code>openTemplate()</code> using <code>type: 'drawer'</code>.</p>
  </div>

  <div *ndwuModalFooter ndwuModalActions>
    <button ndwu-button variant="primary" label="Close template drawer" (click)="modalRef.close()"></button>
  </div>
</ng-template>`;

const SCROLLABLE_DRAWER = `<ng-template #scrollableDrawer let-modalRef="modalRef">
  <div ndwuModalBody>
    <sb-modal-long-text />
  </div>

  <div *ndwuModalFooter ndwuModalActions>
    <button ndwu-button variant="secondary" label="Close" (click)="modalRef.close(false)"></button>
    <button ndwu-button variant="primary" label="Save" (click)="modalRef.close(true)"></button>
  </div>
</ng-template>`;

const TEMPLATE_DRAWER_CONFIG: NdwuDrawerConfig = {
  title: 'Template drawer',
  description: 'Drawer content rendered from an ng-template.',
};

const SCROLLABLE_DRAWER_CONFIG: NdwuDrawerConfig = {
  title: 'Template drawer with custom footer',
  description: 'Scrollable content rendered from an ng-template with footer actions defined in the same template.',
  autoFocus: 'first-tabbable',
};

const openTemplateDrawer = openTemplateDrawerWith(TEMPLATE_DRAWER_CONFIG);
const openScrollableDrawer = openTemplateDrawerWith(SCROLLABLE_DRAWER_CONFIG);

const TEMPLATE_API_SOURCE = templateExampleSource(
  'TemplateDrawerExampleComponent',
  ['NdwuButtonComponent', 'NdwuModalActionsDirective', 'NdwuModalBodyDirective', 'NdwuModalFooterDirective'],
  [
    {
      ref: 'templateDrawer',
      template: TEMPLATE_DRAWER,
      label: 'Open template drawer',
      method: 'openTemplateDrawer',
      config: TEMPLATE_DRAWER_CONFIG,
    },
    {
      ref: 'scrollableDrawer',
      template: SCROLLABLE_DRAWER,
      label: 'Open scrollable template drawer',
      method: 'openScrollableDrawer',
      config: SCROLLABLE_DRAWER_CONFIG,
    },
  ],
);

export const TemplateApi: Story = {
  name: 'Template API',
  parameters: modalStoryParameters(
    TEMPLATE_API_SOURCE,
    '`openTemplate()` with `type: \'drawer\'` renders an `ng-template` in the drawer; the context gives `modalRef` and `data`. `ndwuModalBody` and `*ndwuModalFooter` work inside the template. The template needs `viewContainerRef`. `sb-modal-long-text` stands for your long content. The scrollable drawer closes with `true` (Save) or `false`.',
  ),
  decorators: [
    withRowLayout,
    moduleMetadata({
      imports: [
        NdwuButtonComponent,
        NdwuModalActionsDirective,
        NdwuModalBodyDirective,
        NdwuModalFooterDirective,
        SbModalLongTextComponent,
      ],
    }),
  ],
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openTemplateDrawer, openScrollableDrawer},
    template: lines([
      TEMPLATE_DRAWER,
      SCROLLABLE_DRAWER,
      modalOpener('Open template drawer', 'openTemplateDrawer', 'templateDrawer'),
      modalOpener('Open scrollable template drawer', 'openScrollableDrawer', 'scrollableDrawer'),
    ]),
  }),
};

const HEADER_DRAWER = `<ng-template #headerDrawer let-modalRef="modalRef">
  <ng-container *ndwuModalHeader>
    <div>
      <h3 tabindex="0">Template drawer header</h3>
      <p>This header is rendered in the drawer container header.</p>
    </div>

    <button ndwu-button variant="secondary" label="Dismiss" (click)="modalRef.close(false)"></button>
  </ng-container>

  <div ndwuModalBody>
    <p>
      This drawer was opened with <code>openTemplate()</code> using <code>type: 'drawer'</code> and defines
      <code>*ndwuModalHeader</code> and <code>*ndwuModalFooter</code> inside the same <code>ng-template</code>.
    </p>
    <p>Use <code>ariaLabel</code> or <code>ariaLabelledby</code> when a custom header replaces the default title.</p>
  </div>

  <div *ndwuModalFooter ndwuModalActions>
    <button ndwu-button variant="secondary" label="Cancel" (click)="modalRef.close(false)"></button>
    <button ndwu-button variant="primary" label="Save" (click)="modalRef.close(true)"></button>
  </div>
</ng-template>`;

const HEADER_DRAWER_CONFIG: NdwuDrawerConfig = {
  ariaLabel: 'Template drawer with custom header and footer slots',
  autoFocus: 'first-heading',
  hasCloseButton: false,
};

const openHeaderDrawer = openTemplateDrawerWith(HEADER_DRAWER_CONFIG);

const TEMPLATE_HEADER_SOURCE = templateExampleSource(
  'TemplateHeaderDrawerExampleComponent',
  [
    'NdwuButtonComponent',
    'NdwuModalActionsDirective',
    'NdwuModalBodyDirective',
    'NdwuModalFooterDirective',
    'NdwuModalHeaderDirective',
  ],
  [
    {
      ref: 'headerDrawer',
      template: HEADER_DRAWER,
      label: 'Open template drawer with custom header',
      method: 'openHeaderDrawer',
      config: HEADER_DRAWER_CONFIG,
    },
  ],
);

export const TemplateHeader: Story = {
  parameters: modalStoryParameters(
    TEMPLATE_HEADER_SOURCE,
    '`*ndwuModalHeader` inside the template replaces the default header; on an `ng-container` its children line up in the drawer header row. With no title, `ariaLabel` names the drawer. Closes with `true` (Save) or `false` (Cancel, Dismiss).',
  ),
  decorators: [
    moduleMetadata({
      imports: [
        NdwuButtonComponent,
        NdwuModalActionsDirective,
        NdwuModalBodyDirective,
        NdwuModalFooterDirective,
        NdwuModalHeaderDirective,
      ],
    }),
  ],
  render: (args) => ({
    props: {afterClosed: args.afterClosed, openHeaderDrawer},
    template: lines([
      HEADER_DRAWER,
      modalOpener('Open template drawer with custom header', 'openHeaderDrawer', 'headerDrawer'),
    ]),
  }),
};

export const OpenedForAccessibility: Story = {
  ...WithForm,
  tags: ['!autodocs'],
  parameters: {
    ...modalStoryParameters(
      FORM_SOURCE,
      'Opens the form drawer in `play` and waits for the slide-in, so the Accessibility panel checks it: `aria-modal`, the name from the title, focus kept inside. Not on the docs page: the drawer would cover it.',
    ),
    sizes: FIELD_SIZES,
  },
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Open form drawer'}));

    const drawer = await screen.findByRole('dialog', {name: FORM_TITLE});

    await Promise.all(drawer.getAnimations().map((animation) => animation.finished));
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(drawer).toContainElement(document.activeElement as HTMLElement | null));

    await userEvent.tab({shift: true});

    await expect(drawer).toContainElement(document.activeElement as HTMLElement | null);
  },
};
