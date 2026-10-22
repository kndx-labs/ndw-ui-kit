import {Component} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {type NdwuHeatStripCell, NdwuHeatStripComponent, NdwuHeatStripTooltipDirective} from '@ndw-ui-kit/charts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NdwuHeatStripComponent, NdwuHeatStripTooltipDirective],
  template: `
    <main [id]="id">
      <ndwu-heat-strip [cells]="cells">
        <ng-template [ndwuHeatStripTooltip]="cells" let-cell>
          {{ cell.data?.label }}
        </ng-template>
      </ndwu-heat-strip>
    </main>
  `,
})
export class AppComponent {
  protected readonly id = uniqueId('consumer-');
  protected readonly cells: NdwuHeatStripCell<{label: string}>[] = [
    {level: 2, data: {label: 'Sample interval'}},
  ];
}
