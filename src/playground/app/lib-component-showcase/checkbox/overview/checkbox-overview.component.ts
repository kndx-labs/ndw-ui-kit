import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NDWU_SIZE, NdwuButtonComponent, NdwuCheckboxComponent} from '@ndw-ui-kit/core';
import {NdwuCheckboxFieldComponent} from '@ndw-ui-kit/core/form-field';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent, ToastComponent} from '@app/components';

@Component({
  selector: 'app-checkbox-overview',
  templateUrl: './checkbox-overview.component.html',
  styleUrl: './checkbox-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuCheckboxComponent,
    NdwuCheckboxFieldComponent,
    NdwuButtonComponent,
    NdwuLocalizePipe,
    ShowcaseLayoutComponent,
    ToastComponent,
  ],
})
export class CheckboxOverviewComponent {
  public readonly SIZE = NDWU_SIZE;

  // Two-layer (parent + 3 children) state
  public readonly twoLayerChild1 = signal(false);
  public readonly twoLayerChild2 = signal(false);
  public readonly twoLayerChild3 = signal(false);

  public readonly twoLayerParentChecked = computed(() => {
    const c1 = this.twoLayerChild1();
    const c2 = this.twoLayerChild2();
    const c3 = this.twoLayerChild3();

    return c1 && c2 && c3;
  });

  public readonly twoLayerParentIndeterminate = computed(() => {
    const c1 = this.twoLayerChild1();
    const c2 = this.twoLayerChild2();
    const c3 = this.twoLayerChild3();
    const count = [c1, c2, c3].filter(Boolean).length;

    return count > 0 && count < 3;
  });

  public onTwoLayerParentChange(checked: boolean): void {
    this.twoLayerChild1.set(checked);
    this.twoLayerChild2.set(checked);
    this.twoLayerChild3.set(checked);
  }

  // Checkbox forms
  public checkboxDefault = new FormGroup({
    checkbox: new FormControl(false),
  });

  public checkboxSizeL = new FormGroup({
    checkbox: new FormControl(false),
  });

  public checkboxSizeXL = new FormGroup({
    checkbox: new FormControl(false),
  });

  public checkboxSizeXXL = new FormGroup({
    checkbox: new FormControl(false),
  });

  public checkboxDisabled = new FormGroup({
    checkbox: new FormControl({value: false, disabled: true}),
  });

  public checkboxDisabledChecked = new FormGroup({
    checkbox: new FormControl({value: true, disabled: true}),
  });

  public checkboxChecked = new FormGroup({
    checkbox: new FormControl(true),
  });

  public checkboxRequired = new FormGroup({
    checkbox: new FormControl(false, {nonNullable: true, validators: Validators.requiredTrue}),
  });
}
