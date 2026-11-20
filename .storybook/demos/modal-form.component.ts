import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuFormContainerComponent,
  NdwuModalActionsDirective,
  NdwuModalFooterDirective,
  NdwuModalRef,
} from '@ndw-ui-kit/core';
import {NdwuInputFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';

export interface SbModalFormValue {
  name: string;
  email: string;
}

@Component({
  selector: 'sb-modal-form',
  template: `
    <ndwu-form-container [formGroup]="form">
      <ndwu-input-field label="Name" ndwuRequired formControlName="name" />
      <ndwu-input-field label="Email" ndwuRequired formControlName="email" />
    </ndwu-form-container>

    <div *ndwuModalFooter ndwuModalActions>
      <button ndwu-button variant="primary" label="OK" [disabled]="form.invalid" (click)="submit()"></button>
    </div>
  `,
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuFormContainerComponent,
    NdwuInputFieldComponent,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
    ReactiveFormsModule,
  ],
})
export class SbModalFormComponent {
  private readonly modalRef = inject<NdwuModalRef<SbModalFormValue>>(NDWU_MODAL_REF);

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [NdwuValidators.required('Enter your name')],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [NdwuValidators.required('Enter your email'), NdwuValidators.email('Enter a valid email')],
    }),
  });

  protected submit(): void {
    this.modalRef.close(this.form.getRawValue());
  }
}
