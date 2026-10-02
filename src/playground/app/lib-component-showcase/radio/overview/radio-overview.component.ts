import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NDWU_SIZE, NdwuButtonComponent, NdwuRadioButtonComponent, NdwuRadioGroupComponent} from '@ndw-ui-kit/core';
import {NdwuRadioFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent, ToastComponent} from '@app/components';

@Component({
  selector: 'app-radio-overview',
  templateUrl: './radio-overview.component.html',
  styleUrl: './radio-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuRadioGroupComponent,
    NdwuRadioButtonComponent,
    NdwuRadioFieldComponent,
    NdwuButtonComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
    ToastComponent,
  ],
})
export class RadioOverviewComponent {
  public readonly SIZE = NDWU_SIZE;

  public radioDefault = new FormGroup({
    option: new FormControl<string | number>(''),
  });

  public radioSizeL = new FormGroup({
    option: new FormControl<string | number>(''),
  });

  public radioSizeXL = new FormGroup({
    option: new FormControl<string | number>(''),
  });

  public radioSizeXXL = new FormGroup({
    option: new FormControl<string | number>(''),
  });

  public radioChecked = new FormGroup({
    option: new FormControl<string | number>('option2'),
  });

  public radioDisabled = new FormGroup({
    option: new FormControl<string | number>({value: '', disabled: true}),
  });

  public radioDisabledChecked = new FormGroup({
    option: new FormControl<string | number>({value: 'option2', disabled: true}),
  });

  public radioDisabledWithText = new FormGroup({
    option: new FormControl<string | number>({value: '', disabled: true}),
  });

  public radioRequired = new FormGroup({
    option: new FormControl<string | number>('', {nonNullable: true, validators: Validators.required}),
  });

  public readonly radioRequiredOptions = [
    {value: 'option1', label: 'radio-showcase.option-1'},
    {value: 'option2', label: 'radio-showcase.option-2'},
  ];

  public readonly nativePlan = signal<string | number>('');
}
