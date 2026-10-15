import {ChangeDetectionStrategy, Component, input} from '@angular/core';

export type NdwuStyledGroupHeaderVariant = 'divider' | 'label';

@Component({
  selector: 'ndwu-styled-group-header',
  templateUrl: './ndwu-styled-group-header.component.html',
  styleUrl: './ndwu-styled-group-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'presentation',
    '[class.ndwu-styled-group-header--label]': 'variant() === "label"',
  },
})
export class NdwuStyledGroupHeaderComponent {
  public readonly variant = input<NdwuStyledGroupHeaderVariant>('divider');
}
