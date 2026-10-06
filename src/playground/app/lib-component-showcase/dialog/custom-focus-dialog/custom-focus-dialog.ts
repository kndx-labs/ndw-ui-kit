import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuModalActionsDirective,
  NdwuModalFooterDirective,
  NdwuModalRef,
} from '@ndw-ui-kit/core';

@Component({
  selector: 'app-confirm-close-dialog',
  templateUrl: './custom-focus-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
  ],
})
export class CustomFocusDialogComponent {
  protected readonly modalRef = inject<NdwuModalRef>(NDWU_MODAL_REF);

  protected closeDialog(): void {
    this.modalRef.close();
  }
}
