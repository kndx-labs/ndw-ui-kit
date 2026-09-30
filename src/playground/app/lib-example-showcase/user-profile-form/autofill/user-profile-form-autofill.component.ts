import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_SIZE,
  NdwuButtonComponent,
  NdwuFloatingLabelComponent,
  NdwuFormContainerComponent,
  NdwuFormFieldComponent,
  NdwuInputDirective,
} from '@ndw-ui-kit/core';
import {NdwuInputFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-user-profile-form-autofill',
  templateUrl: './user-profile-form-autofill.component.html',
  styleUrl: './user-profile-form-autofill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ReactiveFormsModule,
    LocalizePipe,
    ShowcaseLayoutComponent,
    NdwuButtonComponent,
    NdwuFloatingLabelComponent,
    NdwuFormContainerComponent,
    NdwuFormFieldComponent,
    NdwuInputDirective,
    NdwuInputFieldComponent,
  ],
})
export class UserProfileFormAutofillComponent {
  public readonly SIZE = NDWU_SIZE;

  /** `ndwu-input-field` + Angular forms. */
  public readonly form = new FormGroup({
    username: new FormControl('', [NdwuValidators.required()]),
    password: new FormControl('', [NdwuValidators.required()]),
  });

  /** `input[ndwuInput]` + Angular forms. */
  public readonly compoundForm = new FormGroup({
    username: new FormControl('', [NdwuValidators.required()]),
    password: new FormControl('', [NdwuValidators.required()]),
  });

  public onSubmit(event: Event): void {
    // Real submit is needed for the browser to offer saving credentials.
    // Navigation is prevented, so the page stays loaded.
    event.preventDefault();
  }
}
