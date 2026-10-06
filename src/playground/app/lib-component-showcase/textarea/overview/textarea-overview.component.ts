import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_SIZE,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuIconButtonComponent,
  NdwuTextareaActionsDirective,
  NdwuTextareaComponent,
} from '@ndw-ui-kit/core';
import {NdwuHelperMessageComponent, NdwuTextareaFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

const SAMPLE_TEXT = 'This is a textarea';

const SAMPLE_CONFIG = [
  'server:',
  '  host: example.com',
  '  port: 8080',
  '  description: "Local development server"',
  '  timeout: 30',
  '',
  'logging:',
  '  level: info',
  '  format: "{time} {level} {message}"',
  '  file: logs/app.log',
].join('\n');

@Component({
  selector: 'app-textarea-overview',
  templateUrl: './textarea-overview.component.html',
  styleUrl: './textarea-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    LocalizePipe,
    NdwuFloatingLabelComponent,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
    NdwuIconButtonComponent,
    NdwuTextareaActionsDirective,
    NdwuTextareaComponent,
    NdwuTextareaFieldComponent,
    ShowcaseLayoutComponent,
  ],
})
export class TextareaOverviewComponent implements OnInit {
  public readonly SIZE = NDWU_SIZE;

  public readonly compoundValue = signal<string>('');

  public readonly defaultForm = new FormGroup({
    text: new FormControl(''),
  });

  public readonly filledForm = new FormGroup({
    text: new FormControl(SAMPLE_TEXT),
  });

  public readonly sizesForm = new FormGroup({
    xxl: new FormControl(SAMPLE_TEXT),
    xl: new FormControl(SAMPLE_TEXT),
    l: new FormControl(SAMPLE_TEXT),
  });

  public readonly lineNumbersForm = new FormGroup({
    xxl: new FormControl(SAMPLE_CONFIG),
    xl: new FormControl(SAMPLE_CONFIG),
    l: new FormControl(SAMPLE_CONFIG),
  });

  public readonly actionsForm = new FormGroup({
    text: new FormControl(SAMPLE_CONFIG, {nonNullable: true}),
  });

  public readonly invalidForm = new FormGroup({
    text: new FormControl('', [NdwuValidators.required()]),
  });

  public readonly disabledForm = new FormGroup({
    text: new FormControl({value: SAMPLE_TEXT, disabled: true}),
  });

  public readonly readonlyForm = new FormGroup({
    text: new FormControl(SAMPLE_TEXT),
  });

  public readonly fixedSizeForm = new FormGroup({
    text: new FormControl(SAMPLE_TEXT),
  });

  public ngOnInit(): void {
    this.invalidForm.controls.text.markAsTouched();
  }

  public reformat(): void {
    const control = this.actionsForm.controls.text;
    const lines = control.value.split('\n').map((line) => line.trimEnd());

    control.setValue(lines.join('\n').trim());
  }

  public copy(): void {
    void navigator.clipboard?.writeText(this.actionsForm.controls.text.value);
  }

  public clear(): void {
    this.actionsForm.controls.text.setValue('');
  }
}
