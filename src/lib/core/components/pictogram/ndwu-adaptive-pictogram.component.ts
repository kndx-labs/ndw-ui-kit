import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input} from '@angular/core';
import {resolveSizeFlags} from '@ndw-ui-kit/core/utils';
import {PictogramVariant} from '../../../pictogram-presets';
import {NdwuAdaptiveSizeDirective} from '../../directives';
import {NdwuPictogramComponent} from './ndwu-pictogram.component';
import {
  PICTOGRAM_SIZE_FALLBACK,
  PICTOGRAM_SIZE_PRIORITY,
  PictogramBaseName,
  PictogramSize,
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

  public readonly name = input.required<PictogramBaseName>();
  public readonly stretched = input(false, {transform: booleanAttribute});
  public readonly variant = input<PictogramVariant>('DEFAULT');
  public readonly firstColor = input<string>('');
  public readonly secondColor = input<string>('');

  protected readonly resolvedSize = computed<PictogramSize>(() => {
    return resolveSizeFlags(this.adaptiveSvc.sizeFlags(), PICTOGRAM_SIZE_PRIORITY) ?? PICTOGRAM_SIZE_FALLBACK;
  });

  protected readonly effectiveName = computed(() => `${this.name()}_${this.resolvedSize()}`);
}
