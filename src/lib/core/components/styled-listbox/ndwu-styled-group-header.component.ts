import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'ndwu-styled-group-header',
  templateUrl: './ndwu-styled-group-header.component.html',
  styleUrl: './ndwu-styled-group-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'presentation',
  },
})
export class NdwuStyledGroupHeaderComponent {
}
