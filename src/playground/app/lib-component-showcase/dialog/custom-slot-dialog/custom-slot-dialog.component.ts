import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuModalActionsDirective,
  NdwuModalFooterDirective,
  NdwuModalHeaderDirective,
  NdwuModalRef,
} from '@ndw-ui-kit/core';

@Component({
  selector: 'app-custom-slot-dialog',
  templateUrl: './custom-slot-dialog.component.html',
  styleUrl: './custom-slot-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
    NdwuModalHeaderDirective,
  ],
})
export class CustomSlotDialogComponent {
  protected readonly modalRef = inject<NdwuModalRef<boolean>>(NDWU_MODAL_REF);

  protected confirm(): void {
    this.modalRef.close(true);
  }
}
