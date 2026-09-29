import {ChangeDetectionStrategy, Component, OnInit, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NDWU_SIZE, NdwuFormContainerComponent} from '@ndw-ui-kit/core';
import {NdwuCheckboxFieldComponent, NdwuInputFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';
import {EMAIL_VALIDATOR} from '@app/validation';
import {NDWU_SIZE_TOKEN} from 'src/lib/core/tokens';

@Component({
  selector: 'app-form-container-showcase',
  templateUrl: './form-container-showcase.component.html',
  styleUrl: './form-container-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NDWU_SIZE_TOKEN,
    useValue: () => NDWU_SIZE.XXL,
  }],
  imports: [
    ReactiveFormsModule,
    NdwuCheckboxFieldComponent,
    NdwuFormContainerComponent,
    NdwuInputFieldComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class FormContainerShowcaseComponent implements OnInit {
  public readonly SIZE = NDWU_SIZE;
  protected readonly sizeToken = inject(NDWU_SIZE_TOKEN);

  // Form container forms
  public formContainerSizeXL = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    checkbox: new FormControl(false),
  });

  public formContainerSizeXXL = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    checkbox: new FormControl(false),
  });

  public formContainerWithDisabled = new FormGroup({
    email: new FormControl(''),
    password: new FormControl({value: '', disabled: true}),
    checkbox: new FormControl({value: false, disabled: true}),
  });

  public formContainerWithInvalid = new FormGroup({
    email: new FormControl('invalid@', [EMAIL_VALIDATOR, NdwuValidators.required()]),
    password: new FormControl(''),
    checkbox: new FormControl(false, [NdwuValidators.requiredTrue()]),
  });

  public formContainerInheritance = new FormGroup({
    inheritedEmail: new FormControl(''),
    inheritedPassword: new FormControl(''),
    overriddenEmail: new FormControl(''),
    overriddenPassword: new FormControl(''),
  });

  public ngOnInit(): void {
    // Mark invalid controls as touched so the invalid state is visible
    this.formContainerWithInvalid.get('email')?.markAsTouched();
    this.formContainerWithInvalid.get('checkbox')?.markAsTouched();
  }
}
