import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {resolveSizeFlags} from '@ndw-ui-kit/core/utils';
import {NdwuAdaptiveSizeDirective} from '../../directives';
import {NdwuIconComponent} from './ndwu-icon.component';
import {ICON_SIZE_FALLBACK, ICON_SIZE_PRIORITY, IconBaseName, IconSize} from './ndwu-adaptive-icon.helpers';

@Component({
  selector: 'ndwu-adaptive-icon',
  templateUrl: './ndwu-adaptive-icon.component.html',
  styleUrl: './ndwu-adaptive-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent],
  hostDirectives: [{
    directive: NdwuAdaptiveSizeDirective,
    inputs: ['ndwuAdaptiveSize: adaptiveSize'],
  }],
})
export class NdwuAdaptiveIconComponent {
  private readonly adaptiveSvc = inject(NdwuAdaptiveSizeDirective);

  public readonly name = input.required<IconBaseName>();

  protected readonly resolvedSize = computed<IconSize>(() => {
    return resolveSizeFlags(this.adaptiveSvc.sizeFlags(), ICON_SIZE_PRIORITY) ?? ICON_SIZE_FALLBACK;
  });

  protected readonly effectiveName = computed(() => `${this.name()}_${this.resolvedSize()}`);
}
