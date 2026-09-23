import {ChangeDetectionStrategy, Component, booleanAttribute, computed, input} from '@angular/core';
import {extractPictogramDimsClass, pictogramNameTransform} from './ndwu-pictogram.helpers';
import {NdwuPictogramVariant, PICTOGRAM_VARIANTS} from '../../../pictogram-presets';

@Component({
  selector: 'ndwu-pictogram',
  templateUrl: './ndwu-pictogram.component.html',
  styleUrl: './ndwu-pictogram.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class NdwuPictogramComponent {
  public readonly name = input.required({transform: pictogramNameTransform});
  public readonly stretched = input(false, {transform: booleanAttribute});
  public readonly variant = input<NdwuPictogramVariant>('DEFAULT');
  public readonly firstColor = input<string>('');
  public readonly secondColor = input<string>('');

  protected readonly spriteRef = computed(() => `assets/ndw-ui-kit.pictogram.sprite.svg#${this.name()}`);

  protected readonly rootClass = computed(() => {
    if (this.stretched()) {
      return 'ndwu-pictogram ndwu-pictogram--stretch';
    }

    const dimsClass = extractPictogramDimsClass(this.name());

    return dimsClass ? `ndwu-pictogram ${dimsClass}` : 'ndwu-pictogram';
  });

  protected readonly svgStyle = computed(() => {
    const styles: Record<string, string> = {};
    const variant = this.variant();
    const preset = PICTOGRAM_VARIANTS[variant];

    styles['--pictogram-first-color'] = this.firstColor() || preset.firstColor;
    styles['--pictogram-second-color'] = this.secondColor() || preset.secondColor;

    return styles;
  });
}
