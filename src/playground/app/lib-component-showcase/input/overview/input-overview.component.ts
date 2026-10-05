import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuButtonComponent,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuIconComponent,
  NdwuInputDirective,
  NdwuSuffixDirective,
} from '@ndw-ui-kit/core';
import {NdwuHelperMessageComponent, NdwuInputFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {ShowcaseLayoutComponent} from '@app/components';
import {EMAIL_VALIDATOR, ERROR_KEY, VALIDATION_REGEXES} from '@app/validation';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

@Component({
  selector: 'app-input-overview',
  templateUrl: './input-overview.component.html',
  styleUrl: './input-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NdwuButtonComponent,
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
    input: new FormControl('invalid@', [EMAIL_VALIDATOR, NdwuValidators.required()]),
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
        NdwuValidators.pattern(VALIDATION_REGEXES[ERROR_KEY.ASCII_ONLY], 'error.ascii-only'),
      ],
    ),
  });

  public inputReadonly = new FormGroup({
    input: new FormControl('Sample readonly text'),
  });

  public inputReadonlyWithIcon = new FormGroup({
    input: new FormControl('Readonly with icon'),
  });

  public readonly ngModelValue = signal('');

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
