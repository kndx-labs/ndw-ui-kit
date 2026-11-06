import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {NdwuListboxDirective} from '@ndw-ui-kit/core/aria';
import {NdwuSizeDirective} from '../../directives';

@Component({
  selector: 'ndwu-styled-listbox',
  templateUrl: './ndwu-styled-listbox.component.html',
  styleUrl: './ndwu-styled-listbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NdwuListboxDirective,
      inputs: [
        'multi',
        'selectionMode',
        'disabled',
        'orientation',
        'wrap',
        'readonly',
        'typeaheadDelay',
        'values',
        'comboboxRef',
      ],
      outputs: ['valuesChange'],
    },
    {
      directive: NdwuSizeDirective,
      inputs: ['ndwuSize: size'],
    },
  ],
  host: {
    'class': 'ndwu-styled-listbox',
    '[attr.data-size]': 'sizeSvc.effectiveSize()',
    '[style.--ndwu-styled-listbox-max-height]': 'maxHeight()',
  },
})
export class NdwuStyledListboxComponent<V = unknown> {
  public readonly listbox = inject(NdwuListboxDirective<V>);
  public readonly maxVisibleOptions = input<number | null>(null);

  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly maxHeight = computed<string | null>(() => {
    const count = this.maxVisibleOptions();

    return typeof count === 'number' && Number.isFinite(count) && count > 0
      ? `calc(${count} * var(--ndwu-styled-option-height))`
      : null;
  });
}
