import {ChangeDetectionStrategy, Component} from '@angular/core';

/** Label for custom option templates; siblings such as icons and markers keep their size while the label shrinks. */
@Component({
  selector: 'ndwu-option-label',
  template: '<ng-content/>',
  styleUrl: './ndwu-option-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NdwuOptionLabelComponent {}
