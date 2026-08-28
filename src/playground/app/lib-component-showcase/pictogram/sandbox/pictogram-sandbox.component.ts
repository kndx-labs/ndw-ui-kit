import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NdwuPictogramComponent} from '../../../../../lib/core/components/pictogram/ndwu-pictogram.component';
import {PICTOGRAM_NAME, PictogramName} from '../../../../../lib/pictogram-names';
import {PICTOGRAM_VARIANTS, PictogramVariant} from '../../../../../lib/pictogram-presets';

@Component({
  selector: 'app-pictogram-sandbox',
  templateUrl: './pictogram-sandbox.component.html',
  styleUrl: './pictogram-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NdwuPictogramComponent],
})
export class PictogramSandboxComponent {
  public readonly PICTOGRAM_NAME = PICTOGRAM_NAME;
  public readonly allPictograms: PictogramName[] = Object.values(PICTOGRAM_NAME);
  public readonly allVariants: PictogramVariant[] = Object.keys(PICTOGRAM_VARIANTS) as PictogramVariant[];

  public readonly sandboxForm = new FormGroup({
    name: new FormControl<PictogramName>(PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L, {nonNullable: true}),
    variant: new FormControl<PictogramVariant>('DEFAULT', {nonNullable: true}),
    stretched: new FormControl<boolean>(false, {nonNullable: true}),
    firstColor: new FormControl<string>(PICTOGRAM_VARIANTS.DEFAULT.firstColor, {nonNullable: true}),
    secondColor: new FormControl<string>(PICTOGRAM_VARIANTS.DEFAULT.secondColor, {nonNullable: true}),
  });

  public onVariantChange(): void {
    const variant = this.sandboxForm.controls.variant.value;
    const preset = PICTOGRAM_VARIANTS[variant];

    this.sandboxForm.patchValue({
      firstColor: preset.firstColor,
      secondColor: preset.secondColor,
    });
  }

  public resetSandbox(): void {
    this.sandboxForm.reset({
      name: PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L,
      variant: 'DEFAULT' as PictogramVariant,
      stretched: false,
      firstColor: PICTOGRAM_VARIANTS.DEFAULT.firstColor,
      secondColor: PICTOGRAM_VARIANTS.DEFAULT.secondColor,
    });
  }
}
