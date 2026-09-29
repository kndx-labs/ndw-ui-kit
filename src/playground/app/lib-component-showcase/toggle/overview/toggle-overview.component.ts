import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NDWU_SIZE, NDWU_TOGGLE_COLOR} from '@ndw-ui-kit/core';
import {NdwuToggleFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-toggle-overview',
  templateUrl: './toggle-overview.component.html',
  styleUrl: './toggle-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuToggleFieldComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class ToggleOverviewComponent {
  public readonly SIZE = NDWU_SIZE;
  public readonly TOGGLE_COLOR = NDWU_TOGGLE_COLOR;

  public toggleDefault = new FormGroup({
    toggle: new FormControl(false),
  });

  public toggleSizeL = new FormGroup({
    toggle: new FormControl(false),
  });

  public toggleSizeXL = new FormGroup({
    toggle: new FormControl(false),
  });

  public toggleSizeXXL = new FormGroup({
    toggle: new FormControl(false),
  });

  public toggleChecked = new FormGroup({
    toggle: new FormControl(true),
  });

  public toggleDisabled = new FormGroup({
    toggle: new FormControl({value: false, disabled: true}),
  });

  public toggleDisabledChecked = new FormGroup({
    toggle: new FormControl({value: true, disabled: true}),
  });

  public toggleBrand = new FormGroup({
    toggle: new FormControl(false),
  });

  public toggleGreen = new FormGroup({
    toggle: new FormControl(false),
  });

  public toggleBrandChecked = new FormGroup({
    toggle: new FormControl(true),
  });

  public toggleGreenChecked = new FormGroup({
    toggle: new FormControl(true),
  });

  public toggleWithLabel = new FormGroup({
    toggle: new FormControl(false),
  });

  public toggleWithSecondaryText = new FormGroup({
    toggle: new FormControl(false),
  });
}
