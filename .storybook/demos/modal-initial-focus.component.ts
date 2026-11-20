import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuModalActionsDirective,
  NdwuModalFooterDirective,
  NdwuModalRef,
} from '@ndw-ui-kit/core';

@Component({
  selector: 'sb-modal-initial-focus',
  template: `
    <div *ndwuModalFooter ndwuModalActions>
      <button ndwu-button cdkFocusInitial variant="primary" label="Close" (click)="modalRef.close()"></button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuButtonComponent, NdwuModalActionsDirective, NdwuModalFooterDirective],
})
export class SbModalInitialFocusComponent {
  protected readonly modalRef = inject<NdwuModalRef>(NDWU_MODAL_REF);
}
