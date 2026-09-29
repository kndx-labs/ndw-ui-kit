import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuIconComponent,
  NdwuInputDirective,
  NdwuSuffixDirective,
} from '@ndw-ui-kit/core';
import {NdwuHelperMessageComponent, NdwuInputFieldComponent} from '@ndw-ui-kit/core/form-field';
import {ShowcaseLayoutComponent} from '@app/components';
import {ERROR_KEY, ValidatorFactory} from '@app/validation';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

@Component({
  selector: 'app-input-overview',
  templateUrl: './input-overview.component.html',
  styleUrl: './input-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuInputFieldComponent,
    NdwuFormFieldComponent,
    NdwuFloatingLabelComponent,
    NdwuInputDirective,
    NdwuHintDirective,
    NdwuSuffixDirective,
    NdwuHelperMessageComponent,
    NdwuIconComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class InputOverviewComponent implements OnInit {
  public readonly SIZE = NDWU_SIZE;
  public readonly ICON_NAME = NDWU_ICON_NAME;

  public inputDefault = new FormGroup({
    input: new FormControl(''),
  });

  public inputCompound = new FormGroup({
    input: new FormControl(''),
  });

  public inputSizeL = new FormGroup({
    input: new FormControl(''),
  });

  public inputSizeXXL = new FormGroup({
    input: new FormControl(''),
  });

  public inputWithValue = new FormGroup({
    input: new FormControl('Sample text'),
  });

  public inputRequired = new FormGroup({
    input: new FormControl(''),
  });

  public inputRequiredInvalid = new FormGroup({
    input: new FormControl('invalid@', [Validators.email, Validators.required]),
  });

  public inputPassword = new FormGroup({
    input: new FormControl(''),
  });

  public inputPasswordRequired = new FormGroup({
    input: new FormControl(''),
  });

  public inputWithSearchIcon = new FormGroup({
    input: new FormControl(''),
  });

  public inputWithClearIcon = new FormGroup({
    input: new FormControl('Some text to clear'),
  });

  public inputWithIconDisabled = new FormGroup({
    input: new FormControl({value: 'Disabled with icon', disabled: true}),
  });

  public inputWithIconInvalid = new FormGroup({
    input: new FormControl(
      'invalid: ü',
      [
        ValidatorFactory.regexValidatorConstructor(ERROR_KEY.ASCII_ONLY),
      ],
    ),
  });

  public inputReadonly = new FormGroup({
    input: new FormControl('Sample readonly text'),
  });

  public inputReadonlyWithIcon = new FormGroup({
    input: new FormControl('Readonly with icon'),
  });

  public onClearClick(): void {
    this.inputWithClearIcon.get('input')?.setValue('');
  }

  public onSearchClick(): void {
    console.warn('Search clicked');
  }

  public ngOnInit(): void {
    this.inputRequiredInvalid.get('input')?.markAsTouched();
    this.inputWithIconInvalid.get('input')?.markAsTouched();
  }

  public onCopyClick(): void {
    console.warn('Copy clicked');
  }
}
