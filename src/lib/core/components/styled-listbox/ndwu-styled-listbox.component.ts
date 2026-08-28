import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
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
  },
})
export class NdwuStyledListboxComponent<V = unknown> {
  public readonly listbox = inject(NdwuListboxDirective<V>);
  protected readonly sizeSvc = inject(NdwuSizeDirective);
}
