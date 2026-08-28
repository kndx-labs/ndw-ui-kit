import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
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
  constructor(
    @Inject(NDWU_MODAL_REF) protected readonly modalRef: NdwuModalRef,
  ) {
  }

  protected closeDialog(): void {
    this.modalRef.close();
  }
}
