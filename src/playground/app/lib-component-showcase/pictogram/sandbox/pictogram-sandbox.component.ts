import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NdwuPictogramComponent} from '../../../../../lib/core/components/pictogram/ndwu-pictogram.component';
import {NDWU_PICTOGRAM_NAME, NdwuPictogramName} from '../../../../../lib/pictogram-names';
import {NDWU_PICTOGRAM_VARIANTS, NdwuPictogramVariant} from '../../../../../lib/pictogram-presets';

@Component({
  selector: 'app-pictogram-sandbox',
  templateUrl: './pictogram-sandbox.component.html',
  styleUrl: './pictogram-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NdwuPictogramComponent],
})
export class PictogramSandboxComponent {
  public readonly PICTOGRAM_NAME = NDWU_PICTOGRAM_NAME;
  public readonly allPictograms: NdwuPictogramName[] = Object.values(NDWU_PICTOGRAM_NAME);
  public readonly allVariants: NdwuPictogramVariant[] = Object.keys(NDWU_PICTOGRAM_VARIANTS) as NdwuPictogramVariant[];

  public readonly sandboxForm = new FormGroup({
    name: new FormControl<NdwuPictogramName>(NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L, {nonNullable: true}),
    variant: new FormControl<NdwuPictogramVariant>('DEFAULT', {nonNullable: true}),
    stretched: new FormControl<boolean>(false, {nonNullable: true}),
    firstColor: new FormControl<string>(NDWU_PICTOGRAM_VARIANTS.DEFAULT.firstColor, {nonNullable: true}),
    secondColor: new FormControl<string>(NDWU_PICTOGRAM_VARIANTS.DEFAULT.secondColor, {nonNullable: true}),
  });

  public onVariantChange(): void {
    const variant = this.sandboxForm.controls.variant.value;
    const preset = NDWU_PICTOGRAM_VARIANTS[variant];

    this.sandboxForm.patchValue({
      firstColor: preset.firstColor,
      secondColor: preset.secondColor,
    });
  }

  public resetSandbox(): void {
    this.sandboxForm.reset({
      name: NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L,
      variant: 'DEFAULT' as NdwuPictogramVariant,
      stretched: false,
      firstColor: NDWU_PICTOGRAM_VARIANTS.DEFAULT.firstColor,
      secondColor: NDWU_PICTOGRAM_VARIANTS.DEFAULT.secondColor,
    });
  }
}
