import {Component} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {
  type NdwuHeatStripCell,
  NdwuHeatStripComponent,
  NdwuHeatStripMarkerDirective,
  NdwuHeatStripTooltipDirective,
} from '@ndw-ui-kit/charts';

@Component({
  selector: 'app-root',
  imports: [NdwuHeatStripComponent, NdwuHeatStripMarkerDirective, NdwuHeatStripTooltipDirective],
  template: `
    <main [id]="id">
      <ndwu-heat-strip [cells]="cells">
        <ng-template ndwuHeatStripMarker>•</ng-template>
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
