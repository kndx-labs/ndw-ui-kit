import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NDWU_SIZE, NdwuRadioButtonComponent, NdwuRadioGroupComponent} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-radio-overview',
  templateUrl: './radio-overview.component.html',
  styleUrl: './radio-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuRadioGroupComponent,
    NdwuRadioButtonComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
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
}
