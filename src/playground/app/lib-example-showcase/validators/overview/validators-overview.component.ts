import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors} from '@angular/forms';
import {
  NdwuCheckboxFieldComponent,
  NdwuInputFieldComponent,
  NdwuValidators,
  ndwuWrapValidator,
} from '@ndw-ui-kit/core/form-field';
import {ShowcaseLayoutComponent} from '@app/components';

const noSpacesValidator = (control: AbstractControl): ValidationErrors | null => {
  return /\s/.test(String(control.value ?? '')) ? {noSpaces: true} : null;
};

interface ValidatorSection {
  control: string;
  title: string;
  label: string;
}

@Component({
  selector: 'app-validators-overview',
  templateUrl: './validators-overview.component.html',
  styleUrl: './validators-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    NdwuInputFieldComponent,
    NdwuCheckboxFieldComponent,
    ShowcaseLayoutComponent,
  ],
})
export class ValidatorsOverviewComponent implements OnInit {
  public readonly form = new FormGroup({
    required: new FormControl('', [NdwuValidators.required()]),
    requiredTrue: new FormControl(false, [NdwuValidators.requiredTrue()]),
    email: new FormControl('invalid@', [NdwuValidators.email()]),
    min: new FormControl('5', [NdwuValidators.min(18)]),
    max: new FormControl('150', [NdwuValidators.max(120)]),
    minLength: new FormControl('ab', [NdwuValidators.minLength(3)]),
    maxLength: new FormControl('This text is too long', [NdwuValidators.maxLength(10)]),
    pattern: new FormControl('abc', [NdwuValidators.pattern(/^\d+$/)]),
    overridden: new FormControl('This text is too long', [
      NdwuValidators.maxLength(10, 'validators-example.custom.max-length'),
    ]),
    wrapped: new FormControl('has spaces', [
      ndwuWrapValidator(noSpacesValidator, 'validators-example.custom.no-spaces'),
    ]),
  });

  public readonly INPUT_SECTIONS: readonly ValidatorSection[] = [
    {control: 'required', title: 'NdwuValidators.required()', label: 'validators-example.fields.required'},
    {control: 'email', title: 'NdwuValidators.email()', label: 'validators-example.fields.email'},
    {control: 'min', title: 'NdwuValidators.min(18)', label: 'validators-example.fields.min'},
    {control: 'max', title: 'NdwuValidators.max(120)', label: 'validators-example.fields.max'},
    {control: 'minLength', title: 'NdwuValidators.minLength(3)', label: 'validators-example.fields.min-length'},
    {control: 'maxLength', title: 'NdwuValidators.maxLength(10)', label: 'validators-example.fields.max-length'},
    {control: 'pattern', title: 'NdwuValidators.pattern(/^\\d+$/)', label: 'validators-example.fields.pattern'},
    {
      control: 'overridden',
      title: 'NdwuValidators.maxLength(10, \'validators-example.custom.max-length\')',
      label: 'validators-example.fields.overridden',
    },
    {
      control: 'wrapped',
      title: 'ndwuWrapValidator(noSpacesValidator, \'validators-example.custom.no-spaces\')',
      label: 'validators-example.fields.wrapped',
    },
  ];

  public ngOnInit(): void {
    this.form.markAllAsTouched();
  }
}
