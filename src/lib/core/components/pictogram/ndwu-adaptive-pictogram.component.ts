import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input} from '@angular/core';
import {resolveSizeFlags} from '@ndw-ui-kit/core/utils';
import {NdwuPictogramVariant} from '../../../pictogram-presets';
import {NdwuAdaptiveSizeDirective} from '../../directives';
import {NdwuPictogramComponent} from './ndwu-pictogram.component';
import {
  NDWU_PICTOGRAM_SIZE_FALLBACK,
  NDWU_PICTOGRAM_SIZE_PRIORITY,
  NdwuPictogramBaseName,
  NdwuPictogramSize,
} from './ndwu-adaptive-pictogram.helpers';

@Component({
  selector: 'ndwu-adaptive-pictogram',
  templateUrl: './ndwu-adaptive-pictogram.component.html',
  styleUrl: './ndwu-adaptive-pictogram.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuPictogramComponent],
  hostDirectives: [{
    directive: NdwuAdaptiveSizeDirective,
    inputs: ['ndwuAdaptiveSize: adaptiveSize'],
  }],
  host: {
    '[class.ndwu-adaptive-pictogram--stretch]': 'stretched()',
  },
})
export class NdwuAdaptivePictogramComponent {
  private readonly adaptiveSvc = inject(NdwuAdaptiveSizeDirective);

  public readonly name = input.required<NdwuPictogramBaseName>();
  public readonly stretched = input(false, {transform: booleanAttribute});
  public readonly variant = input<NdwuPictogramVariant>('DEFAULT');
  public readonly firstColor = input<string>('');
  public readonly secondColor = input<string>('');

  protected readonly resolvedSize = computed<NdwuPictogramSize>(() => {
    return resolveSizeFlags(this.adaptiveSvc.sizeFlags(), NDWU_PICTOGRAM_SIZE_PRIORITY) ?? NDWU_PICTOGRAM_SIZE_FALLBACK;
  });

  protected readonly effectiveName = computed(() => `${this.name()}_${this.resolvedSize()}`);
}
