import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input} from '@angular/core';
import {Size} from '../../../shared.types';
import {NdwuSizeDirective} from '../../directives';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

@Component({
  selector: 'ndwu-label-group',
  templateUrl: './ndwu-label-group.component.html',
  styleUrl: './ndwu-label-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuLabelGroupComponent {
  public readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly label = input<string>('');
  public readonly secondaryText = input<string>('');
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly size = input<Size | undefined>(undefined);

  protected readonly rootClass = computed(() => {
    const effectiveSize = this.size() ?? this.sizeSvc.effectiveSize();
    const sizeClass = `ndwu-label-group--${effectiveSize}`;
    const disabledClass = this.disabled() ? 'ndwu-label-group--disabled' : '';

    return `ndwu-label-group ${sizeClass} ${disabledClass}`.trim();
  });
}
