import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuModalBodyDirective,
  NdwuModalConfig,
  NdwuModalFooterDirective,
  NdwuModalRef,
  NdwuModalService,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

@Component({
  selector: 'app-nested-modal-dialog',
  templateUrl: './nested-modal-dialog.component.html',
  styleUrl: './nested-modal-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuModalBodyDirective,
    NdwuModalFooterDirective,
    LocalizePipe,
  ],
})
export class NestedModalDialogComponent {
  protected readonly modalRef = inject<NdwuModalRef>(NDWU_MODAL_REF);
  protected modalService = inject(NdwuModalService);

  protected get isParent(): boolean {
    return !!(this.modalRef.config.data as Record<string, unknown> | undefined)?.['isParent'];
  }

  protected openNestedDialog(): void {
    const config: NdwuModalConfig<{isParent: boolean}> = {
      title: 'dialog-showcase.overview.nested-modal.nested-dialog.title',
      description: 'dialog-showcase.overview.nested-modal.nested-dialog.description',
      data: {isParent: false},
    };

    if (this.modalRef.config.theme !== undefined) {
      config.theme = this.modalRef.config.theme;
    }

    if (this.modalRef.config.stackingOnMobile !== undefined) {
      config.stackingOnMobile = this.modalRef.config.stackingOnMobile;
    }

    this.modalService.openDialog(NestedModalDialogComponent, config);
  }

  protected closeDialog(): void {
    this.modalRef.closeIfAllowed();
  }
}
