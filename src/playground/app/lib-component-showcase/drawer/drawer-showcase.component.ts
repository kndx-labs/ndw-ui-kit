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
import {Observable} from 'rxjs';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuButtonComponent,
  NdwuDialogContainerComponent,
  NdwuModalActionsDirective,
  NdwuModalBodyDirective,
  NdwuModalFooterDirective,
  NdwuModalHeaderDirective,
  NdwuModalService,
  type NdwuModalTemplateContext,
  NdwuTheme,
} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';
import {MarkdownDocumentPipe} from '@app/pipes/markdown-document.pipe';
import {FormDialogComponent} from '../dialog/form-dialog/form-dialog.component';
import {CustomSlotDialogComponent} from '../dialog/custom-slot-dialog/custom-slot-dialog.component';
import {ScrollableDialogComponent} from '../dialog/scrollable-dialog/scrollable-dialog.component';

@Component({
  selector: 'app-drawer-showcase',
  templateUrl: './drawer-showcase.component.html',
  styleUrl: './drawer-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuLocalizePipe,
    MarkdownDocumentPipe,
    NdwuButtonComponent,
    NdwuModalBodyDirective,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
    NdwuModalHeaderDirective,
    ShowcaseLayoutComponent,
  ],
})
export class DrawerShowcaseComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  protected readonly httpClient = inject(HttpClient);
  protected readonly modalService = inject(NdwuModalService);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly viewContainerRef = inject(ViewContainerRef);

  protected readonly templateDrawer = viewChild.required<TemplateRef<NdwuModalTemplateContext>>('templateDrawer');
  protected readonly templateDrawerWithCustomSlots = viewChild.required<TemplateRef<NdwuModalTemplateContext<boolean>>>(
    'templateDrawerWithCustomSlots',
  );
  protected readonly scrollableTemplateDrawer = viewChild.required<
    TemplateRef<NdwuModalTemplateContext<string, boolean>>
  >(
    'scrollableTemplateDrawer',
  );

  protected openDefault(theme: NdwuTheme): void {
    this.modalService.openDrawer(
      NdwuDialogContainerComponent,
      {
        title: 'drawer-showcase.overview.default.title',
        description: 'drawer-showcase.overview.default.description',
        theme,
        buttons: [
          {label: 'drawer-showcase.overview.common.button-cancel'},
          {label: 'drawer-showcase.overview.common.button-ok', variant: 'primary'},
        ],
      },
    );
  }

  protected openXXL(theme: NdwuTheme): void {
    this.modalService.openDrawer(
      NdwuDialogContainerComponent,
      {
        title: 'drawer-showcase.overview.xl.title',
        description: 'drawer-showcase.overview.xl.description',
        size: NDWU_SIZE.XXL,
        theme,
        buttons: [
          {label: 'drawer-showcase.overview.common.button-cancel'},
          {label: 'drawer-showcase.overview.common.button-save', variant: 'primary'},
        ],
      },
    );
  }

  protected openWithForm(theme: NdwuTheme): void {
    this.modalService.openDrawer(
      FormDialogComponent,
      {
        title: 'drawer-showcase.overview.form.title',
        theme,
      },
    );
  }

  protected openWithCustomSlots(theme: NdwuTheme): void {
    this.modalService.openDrawer(
      CustomSlotDialogComponent,
      {
        ariaLabel: 'Drawer with custom header and footer slots',
        autoFocus: 'first-heading',
        hasCloseButton: false,
        theme,
      },
    );
  }

  protected openTemplateDrawer(theme: NdwuTheme): void {
    this.modalService.openTemplate(
      this.templateDrawer(),
      {
        type: 'drawer',
        viewContainerRef: this.viewContainerRef,
        config: {
          title: 'Template drawer',
          description: 'Drawer content rendered from an ng-template.',
          theme,
        },
      },
    );
  }

  protected openTemplateDrawerWithCustomSlots(theme: NdwuTheme): void {
    this.modalService.openTemplate<boolean>(
      this.templateDrawerWithCustomSlots(),
      {
        type: 'drawer',
        viewContainerRef: this.viewContainerRef,
        config: {
          ariaLabel: 'Template drawer with custom header and footer slots',
          autoFocus: 'first-heading',
          hasCloseButton: false,
          theme,
        },
      },
    );
  }

  protected openTemplateDrawerWithCustomFooter(theme: NdwuTheme): void {
    this.getLongMarkdownText()
      .subscribe((markdownText) => {
        this.modalService.openTemplate<string, boolean>(
          this.scrollableTemplateDrawer(),
          {
            type: 'drawer',
            viewContainerRef: this.viewContainerRef,
            config: {
              title: 'Template drawer with custom footer',
              description:
                'Scrollable content rendered from an ng-template with footer actions defined in the same template.',
              autoFocus: 'first-tabbable',
              theme,
              data: markdownText,
            },
          },
        );
      });
  }

  protected openScrollable(theme: NdwuTheme): void {
    this.getLongMarkdownText()
      .subscribe((markdownText) => {
        this.modalService.openDrawer(
          ScrollableDialogComponent,
          {
            title: 'drawer-showcase.overview.scrollable.title',
            data: markdownText,
            theme,
            buttons: [
              {label: 'drawer-showcase.overview.common.button-ok', variant: 'primary'},
            ],
          },
        );
      });
  }

  private getLongMarkdownText(): Observable<string> {
    return this.httpClient.get(
      '/assets/md/long-dialog-text.md',
      {responseType: 'text', observe: 'body'},
    );
  }
}
