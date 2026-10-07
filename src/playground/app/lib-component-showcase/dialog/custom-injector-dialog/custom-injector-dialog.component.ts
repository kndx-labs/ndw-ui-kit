import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {NDWU_MODAL_REF, NdwuButtonComponent, NdwuModalBodyDirective, NdwuModalFooterDirective} from '@ndw-ui-kit/core';
import {ShowcaseScopedService} from './showcase-scoped.service';

@Component({
  selector: 'app-custom-injector-dialog',
  templateUrl: './custom-injector-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuModalBodyDirective,
    NdwuModalFooterDirective,
  ],
})
export class CustomInjectorDialogComponent {
  private readonly modalRef = inject(NDWU_MODAL_REF);

  protected readonly scopedService = inject(ShowcaseScopedService, {optional: true});

  protected closeDialog(): void {
    this.modalRef.close();
  }
}
