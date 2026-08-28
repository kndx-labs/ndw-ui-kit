import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewContainerRef,
  inject,
  viewChild,
} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {
  ICON_NAME,
  NdwuButtonComponent,
  NdwuDialogContainerComponent,
  NdwuModalActionsDirective,
  NdwuModalBodyDirective,
  NdwuModalFooterDirective,
  NdwuModalHeaderDirective,
  NdwuModalRef,
  NdwuModalService,
  type NdwuModalTemplateContext,
  NdwuTheme,
} from '@ndw-ui-kit/core';
import {LocalizePipe, UiKitTranslationService} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';
import {MarkdownDocumentPipe} from '@app/pipes/markdown-document.pipe';
import {ScrollableDialogComponent} from './scrollable-dialog/scrollable-dialog.component';
import {FormDialogComponent} from './form-dialog/form-dialog.component';
import {CustomSlotDialogComponent} from './custom-slot-dialog/custom-slot-dialog.component';
import {DelayedCloseDialogComponent} from './delayed-close-dialog/delayed-close-dialog.component';
import {ConfirmCloseDialogComponent} from './confirm-close-dialog/confirm-close-dialog.component';
import {CustomFocusDialogComponent} from './custom-focus-dialog/custom-focus-dialog';
import {NestedModalDialogComponent} from './nested-modal-dialog/nested-modal-dialog.component';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dialog-showcase',
  templateUrl: './dialog-showcase.component.html',
  styleUrl: './dialog-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    MarkdownDocumentPipe,
    NdwuButtonComponent,
    NdwuModalBodyDirective,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
    NdwuModalHeaderDirective,
    ReactiveFormsModule,
    ShowcaseLayoutComponent,
  ],
})
export class DialogShowcaseComponent {
  protected readonly ICON_NAME = ICON_NAME;

  protected readonly httpClient = inject(HttpClient);
  protected readonly modalService = inject(NdwuModalService);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly translation = inject(UiKitTranslationService);
  protected readonly viewContainerRef = inject(ViewContainerRef);

  protected readonly templateDialog = viewChild.required<TemplateRef<NdwuModalTemplateContext>>('templateDialog');
  // @dprint-ignore
  protected readonly scrollableTemplateDialog = viewChild.required<TemplateRef<NdwuModalTemplateContext<string, boolean>>>('scrollableTemplateDialog');

  protected isAlertOpened = false;
  protected confirmResult: boolean | null = null;
  protected selectedUser: User | null = null;
  protected formResult: {name: string; email: string} | null = null;

  protected readonly users: User[] = [
    {id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin'},
    {id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor'},
    {id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer'},
  ];

  protected openServiceAlert(theme: NdwuTheme): void {
    const ref = this.modalService.alert({
      header: 'dialog-showcase.overview.alert.dialog.title',
      description: 'dialog-showcase.overview.alert.dialog.description',
      buttonText: 'dialog-showcase.overview.alert.dialog.button-got-it',
      theme,
    });

    this.isAlertOpened = true;

    ref.afterClosed$
      .subscribe(() => {
        this.isAlertOpened = false;

        this.cdr.detectChanges();
      });
  }

  protected openServiceConfirm(theme: NdwuTheme): void {
    this.confirmResult = null;

    const ref = this.modalService.confirm({
      header: 'dialog-showcase.overview.confirm.dialog.title',
      description: 'dialog-showcase.overview.confirm.dialog.description',
      confirmText: 'dialog-showcase.overview.confirm.dialog.button-confirm',
      cancelText: 'dialog-showcase.overview.confirm.dialog.button-cancel',
      confirmVariant: 'secondary-negative',
      theme,
    });

    ref.afterClosed$
      .subscribe(result => {
        this.confirmResult = result ?? false;

        this.cdr.detectChanges();
      });
  }

  protected openServiceFormDialog(theme: NdwuTheme): void {
    this.formResult = null;

    const ref = this.modalService.openDialog<unknown, {name: string; email: string}>(
      FormDialogComponent,
      {
        title: 'dialog-showcase.overview.form-dialog.dialog.title',
        description: 'dialog-showcase.overview.form-dialog.dialog.description',
        autoFocus: true,
        theme,
      },
    );

    ref.afterClosed$
      .subscribe(result => {
        if (result) {
          this.formResult = result;

          this.cdr.detectChanges();
        }
      });
  }

  protected openTemplateDialog(theme: NdwuTheme): void {
    this.modalService.openTemplate(
      this.templateDialog(),
      {
        type: 'dialog',
        viewContainerRef: this.viewContainerRef,
        config: {
          autoFocus: 'first-tabbable',
          hasCloseButton: false,
          theme,
          width: '560px',
        },
      },
    );
  }

  protected openTemplateDialogWithCustomFooter(theme: NdwuTheme): void {
    this.getLongMarkdownText()
      .subscribe((markdownText) => {
        this.modalService.openTemplate<string, boolean>(
          this.scrollableTemplateDialog(),
          {
            type: 'dialog',
            viewContainerRef: this.viewContainerRef,
            config: {
              title: 'Template dialog with custom footer',
              // @dprint-ignore
              description: 'Scrollable content rendered from an ng-template with footer actions defined in the same template.',
              autoFocus: 'first-tabbable',
              theme,
              width: '80vw',
              maxWidth: '960px',
              height: '80vh',
              data: markdownText,
            },
          },
        );
      });
  }

  protected openComponentDialogWithCustomSlots(theme: NdwuTheme): void {
    this.modalService.openDialog(
      CustomSlotDialogComponent,
      {
        ariaLabel: 'Dialog with custom header and footer slots',
        autoFocus: 'first-heading',
        hasCloseButton: false,
        theme,
        width: '560px',
      },
    );
  }

  protected openResultDialog(theme: NdwuTheme): void {
    this.selectedUser = null;

    const buttons = this.users.map(user => {
      return {
        label: user.name,
        result: user,
      };
    });

    const ref = this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.result-dialog.dialog.title',
        description: 'dialog-showcase.overview.result-dialog.dialog.description',
        data: {users: this.users},
        theme,
        buttons,
        width: '500px',
      },
    );

    ref.afterClosed$
      .subscribe((result) => {
        if (result) {
          this.selectedUser = result as User;

          this.cdr.detectChanges();
        }
      });
  }

  protected openScrollableDialog(theme: NdwuTheme): void {
    this.getLongMarkdownText()
      .subscribe((markdownText) => {
        this.modalService.openDialog(
          ScrollableDialogComponent,
          {
            title: 'dialog-showcase.overview.scrollable-dialog.dialog.title',
            data: markdownText,
            width: '80vw',
            theme,
            buttons: [
              {label: 'dialog-showcase.overview.common.button-ok', variant: 'primary'},
            ],
          },
        );
      });
  }

  protected openSmallDialog(theme: NdwuTheme): void {
    const width = '250px';
    const height = '150px';
    const widthScalar = width.replace('px', '');

    this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.size.small-dialog.title',
        description: this.translation.instant(
          'dialog-showcase.overview.size.small-dialog.description',
          {width: widthScalar, height},
        ),
        width,
        height,
        theme,
        buttons: [{label: 'dialog-showcase.overview.common.button-close', variant: 'primary'}],
      },
    );
  }

  protected openNarrowDialog(theme: NdwuTheme): void {
    this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.size.narrow-dialog.title',
        description: 'dialog-showcase.overview.size.narrow-dialog.description',
        width: '300px',
        maxWidth: '400px',
        height: '200px',
        theme,
        buttons: [{label: 'dialog-showcase.overview.common.button-close', variant: 'primary'}],
      },
    );
  }

  protected openWideDialog(theme: NdwuTheme): void {
    this.getLongMarkdownText()
      .subscribe((markdownText) => {
        const width = '80vw';
        const maxWidth = '1000px';
        const extraHeader = this.translation.instant(
          'dialog-showcase.overview.size.wide-dialog.html-heading',
          {width, maxWidth},
        );

        const fullText = `
          <h4>${extraHeader}</h4>
          <br/>

          ${markdownText}
        `;

        this.modalService.openDialog(
          ScrollableDialogComponent,
          {
            title: 'dialog-showcase.overview.size.wide-dialog.title',
            data: fullText.trimStart(),
            width,
            maxWidth,
            theme,
            buttons: [
              {label: 'dialog-showcase.overview.common.button-ok', variant: 'primary'},
            ],
          },
        );
      });
  }

  protected openAutoFocus(theme: NdwuTheme): void {
    this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.focus.auto-focus-dialog.title',
        description: 'dialog-showcase.overview.focus.auto-focus-dialog.description',
        autoFocus: 'first-heading',
        theme,
        buttons: [{label: 'dialog-showcase.overview.common.button-close', variant: 'primary'}],
      },
    );
  }

  protected openNoFocusTrap(theme: NdwuTheme): void {
    this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.focus.no-focus-trap-dialog.title',
        description: 'dialog-showcase.overview.focus.no-focus-trap-dialog.description',
        trapFocus: false,
        theme,
        buttons: [{label: 'dialog-showcase.overview.common.button-close', variant: 'primary'}],
      },
    );
  }

  protected openAutoFocusFirstTabbable(theme: NdwuTheme): void {
    this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.focus.auto-focus-first-tabbable-dialog.title',
        description: 'dialog-showcase.overview.focus.auto-focus-first-tabbable-dialog.description',
        autoFocus: 'first-tabbable',
        theme,
        buttons: [{
          label: 'dialog-showcase.overview.common.button-close',
          variant: 'primary',
        }],
      },
    );
  }

  protected openCustomFocus(theme: NdwuTheme): void {
    this.modalService.openDialog(
      CustomFocusDialogComponent,
      {
        title: 'dialog-showcase.overview.focus.custom-focus-dialog.title',
        description: 'dialog-showcase.overview.focus.custom-focus-dialog.description',
        autoFocus: true,
        theme,
      },
    );
  }

  protected openLoadingDialog(theme: NdwuTheme): void {
    const ref = this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.loading.dialog.title',
        description: 'dialog-showcase.overview.loading.dialog.description',
        isLoading: true,
        theme,
        buttons: [
          {label: 'dialog-showcase.overview.common.button-close', result: null},
          {
            label: 'dialog-showcase.overview.loading.dialog.button-reload',
            variant: 'primary',
            onClick: (dialogRef: NdwuModalRef) => {
              dialogRef.isLoading.set(true);
              setTimeout(() => dialogRef.isLoading.set(false), 2000);
            },
          },
        ],
      },
    );

    setTimeout(() => ref.isLoading.set(false), 2000);
  }

  protected openAsyncTitleDescriptionDialog(theme: NdwuTheme): void {
    const ref = this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.async-title-description.dialog.initial-title',
        description: 'dialog-showcase.overview.async-title-description.dialog.initial-description',
        isLoading: false,
        theme,
        buttons: [{label: 'dialog-showcase.overview.common.button-close', variant: 'primary'}],
      },
    );

    const updateTimerId = setTimeout(
      () => {
        ref.title.set('dialog-showcase.overview.async-title-description.dialog.loaded-title');
        ref.description.set('dialog-showcase.overview.async-title-description.dialog.loaded-description');
      },
      2000,
    );

    ref.afterClosed$
      .subscribe(() => {
        clearTimeout(updateTimerId);
      });
  }

  protected openDelayedCloseDialog(theme: NdwuTheme): void {
    this.modalService.openDialog(
      DelayedCloseDialogComponent,
      {
        title: 'dialog-showcase.overview.on-close-handler.delayed-close-dialog.title',
        description: 'dialog-showcase.overview.on-close-handler.delayed-close-dialog.description',
        theme,
      },
    );
  }

  protected openConfirmToCloseDialog(theme: NdwuTheme): void {
    this.modalService.openDialog(
      ConfirmCloseDialogComponent,
      {
        title: 'dialog-showcase.overview.on-close-handler.confirm-to-close-dialog.title',
        theme,
      },
    );
  }

  protected openNestedModalDialog(theme: NdwuTheme): void {
    this.modalService.openDialog(
      NestedModalDialogComponent,
      {
        title: 'dialog-showcase.overview.nested-modal.parent-dialog.title',
        data: {isParent: true},
        theme,
      },
    );
  }

  protected openNestedModalDialogWithStacking(theme: NdwuTheme): void {
    this.modalService.openDialog(
      NestedModalDialogComponent,
      {
        title: 'dialog-showcase.overview.nested-modal.parent-dialog.title',
        data: {isParent: true},
        stackingOnMobile: 'stack',
        theme,
      },
    );
  }

  protected openNestedModalDialogWithoutStacking(theme: NdwuTheme): void {
    this.modalService.openDialog(
      NestedModalDialogComponent,
      {
        title: 'dialog-showcase.overview.nested-modal.parent-dialog.title',
        data: {isParent: true},
        stackingOnMobile: 'none',
        theme,
      },
    );
  }

  protected openDrawerDialogBugDemo(theme: NdwuTheme): void {
    this.modalService.openDrawer(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.drawer-dialog-stacking.drawer.title',
        description: 'dialog-showcase.overview.drawer-dialog-stacking.drawer.description',
        theme,
        buttons: [
          {
            label: 'dialog-showcase.overview.drawer-dialog-stacking.drawer.button-open-dialog',
            variant: 'primary',
            onClick: () => this.openDialogOverDrawer(theme),
          },
        ],
      },
    );
  }

  private openDialogOverDrawer(theme: NdwuTheme): void {
    this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: 'dialog-showcase.overview.drawer-dialog-stacking.dialog.title',
        description: 'dialog-showcase.overview.drawer-dialog-stacking.dialog.description',
        theme,
        buttons: [
          {label: 'dialog-showcase.overview.common.button-close'},
        ],
      },
    );
  }

  protected getLongMarkdownText(): Observable<string> {
    return this.httpClient.get(
      '/assets/md/long-dialog-text.md',
      {responseType: 'text', observe: 'body'},
    );
  }
}
