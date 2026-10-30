import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_SIZE,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  type NdwuSize,
  NdwuTextareaComponent,
} from '@ndw-ui-kit/core';
import {NdwuHelperMessageComponent, NdwuTextareaFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

const ERROR_KEY = 'textarea-showcase.resize-width.error';

@Component({
  selector: 'app-textarea-resize-width',
  templateUrl: './textarea-resize-width.component.html',
  styleUrl: './textarea-resize-width.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuLocalizePipe,
    NdwuFloatingLabelComponent,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
    NdwuTextareaComponent,
    NdwuTextareaFieldComponent,
    ShowcaseLayoutComponent,
  ],
})
export class TextareaResizeWidthComponent implements OnInit {
  public readonly SIZE = NDWU_SIZE;
  public readonly LABEL_KEY = 'textarea-showcase.resize-width.label';
  public readonly HINT_KEY = 'textarea-showcase.resize-width.hint';
  public readonly ERROR_KEY = ERROR_KEY;
  public readonly SAMPLE_VALUE =
    'The connection serves the regional analytics platform.\nUse it for approved data exchange and document its owner, purpose, retention period, and operational contact.';

  public readonly sizes: readonly {size: NdwuSize; label: string; controlName: 'l' | 'xl' | 'xxl'}[] = [
    {size: NDWU_SIZE.L, label: 'L', controlName: 'l'},
    {size: NDWU_SIZE.XL, label: 'XL', controlName: 'xl'},
    {size: NDWU_SIZE.XXL, label: 'XXL', controlName: 'xxl'},
  ];

  public readonly fieldForm = new FormGroup({
    l: new FormControl('', [NdwuValidators.required(ERROR_KEY)]),
    xl: new FormControl('', [NdwuValidators.required(ERROR_KEY)]),
    xxl: new FormControl('', [NdwuValidators.required(ERROR_KEY)]),
  });

  public ngOnInit(): void {
    this.fieldForm.markAllAsTouched();
  }
}
