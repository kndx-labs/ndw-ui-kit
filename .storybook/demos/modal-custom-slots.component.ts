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
  template: `
    <section *ndwuModalHeader class="header">
      <div>
        <h3 class="title" tabindex="0">Custom slot header</h3>
        <p class="subtitle">This header is rendered in the modal container header area.</p>
      </div>

      <button ndwu-button variant="secondary" label="Close" (click)="modalRef.close(false)"></button>
    </section>

    <div class="content">
      <p>
        This component uses <code>*ndwuModalHeader</code> and <code>*ndwuModalFooter</code>, so the header and footer
        are rendered by the dialog or drawer container, not inside the scrollable body.
      </p>
      <p>
        Use <code>ariaLabel</code> or <code>ariaLabelledby</code> in the modal config when the default title is
        replaced by a custom header.
      </p>
    </div>

    <div *ndwuModalFooter ndwuModalActions>
      <button ndwu-button variant="secondary" label="Cancel" (click)="modalRef.close(false)"></button>
      <button ndwu-button variant="primary" label="Save" (click)="modalRef.close(true)"></button>
    </div>
  `,
  styles: `
    .header {
      display: flex;
      flex-grow: 1;
      gap: 16px;
      justify-content: space-between;
      align-items: flex-start;
    }

    .title {
      margin: 0;
    }

    .subtitle {
      margin: 8px 0 0;
      color: var(--ndwu-color-gray-60);
    }

    .content {
      display: grid;
      gap: 16px;
    }
  `,
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
