import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {NdwuOptionDirective} from '@ndw-ui-kit/core/aria';

@Component({
  selector: 'ndwu-styled-option',
  templateUrl: './ndwu-styled-option.component.html',
  styleUrl: './ndwu-styled-option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{
    directive: NdwuOptionDirective,
    inputs: ['value', 'label', 'disabled'],
  }],
  host: {
    '[class.ndwu-styled-option--selected]': 'option.selected()',
    '[class.ndwu-styled-option--selected-first]': 'option.firstInSelectedGroup()',
    '[class.ndwu-styled-option--selected-last]': 'option.lastInSelectedGroup()',
    '[class.ndwu-styled-option--active]': 'option.active()',
    '[class.ndwu-styled-option--disabled]': 'option.disabled()',
  },
})
export class NdwuStyledOptionComponent<V = unknown> {
  public readonly option = inject(NdwuOptionDirective<V>);
}
