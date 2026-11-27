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
  selector: 'sb-modal-custom-slots',
  templateUrl: './modal-custom-slots.component.html',
  styleUrl: './modal-custom-slots.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
    NdwuModalHeaderDirective,
  ],
})
export class SbModalCustomSlotsComponent {
  protected readonly modalRef = inject<NdwuModalRef<boolean>>(NDWU_MODAL_REF);
}
