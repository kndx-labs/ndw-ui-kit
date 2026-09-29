import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuFormContainerComponent,
  NdwuIconButtonComponent,
  NdwuModalActionsDirective,
  NdwuModalFooterDirective,
  NdwuModalRef,
  NdwuPopoverDirective,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuInputFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {EMAIL_VALIDATOR} from '@app/validation';

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuButtonComponent,
    NdwuFormContainerComponent,
    NdwuIconButtonComponent,
    NdwuInputFieldComponent,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
    NdwuPopoverDirective,
    ReactiveFormsModule,
  ],
})
export class FormDialogComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  protected readonly form: FormGroup;

  constructor(
    protected formBuilder: FormBuilder,
    @Inject(NDWU_MODAL_REF) protected modalRef: NdwuModalRef,
  ) {
    this.form = this.formBuilder.group({
      name: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            NdwuValidators.required(),
          ],
        },
      ),
      email: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            NdwuValidators.required(),
            EMAIL_VALIDATOR,
          ],
        },
      ),
    });
  }

  public onOkClick(): void {
    this.modalRef.close(this.form.value);
  }
}
