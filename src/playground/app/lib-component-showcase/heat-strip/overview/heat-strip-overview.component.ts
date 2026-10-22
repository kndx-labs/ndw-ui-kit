import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {
  type NdwuHeatStripCell,
  NdwuHeatStripComponent,
  type NdwuHeatStripLevel,
  NdwuHeatStripMarkerDirective,
  NdwuHeatStripTooltipDirective,
} from '@ndw-ui-kit/charts';
import {NdwuButtonComponent} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe, NdwuTranslationService} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

interface HeatStripDatum {
  from: string;
  to: string;
  value: number;
}

const levelFor = (index: number): NdwuHeatStripLevel => {
  return (index % 6) as NdwuHeatStripLevel;
};

const timeAt = (index: number): string => {
  return `${String(index).padStart(2, '0')}:00`;
};

@Component({
  selector: 'app-heat-strip-overview',
  templateUrl: './heat-strip-overview.component.html',
  styleUrl: './heat-strip-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuHeatStripComponent,
    NdwuHeatStripTooltipDirective,
    NdwuHeatStripMarkerDirective,
    NdwuButtonComponent,
    NdwuLocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class HeatStripOverviewComponent {
  private readonly translationService = inject(NdwuTranslationService);

  protected readonly mainAxisLabels = ['00:00', '06:00', '12:00', '18:00', '24:00'];
  protected readonly narrowAxisLabels = ['00:00', '24:00'];
  protected readonly regularCells: readonly NdwuHeatStripCell<HeatStripDatum>[] = Array.from(
    {length: 24},
    (_, index) => {
      return {
        level: levelFor(index),
        data: {
          from: timeAt(index),
          to: timeAt(index + 1),
          value: 12 + ((index * 17) % 89),
        },
      };
    },
  );
  protected readonly narrowCells: readonly NdwuHeatStripCell<HeatStripDatum>[] = this.regularCells.slice(0, 12);
  protected readonly allNullCells: readonly NdwuHeatStripCell<HeatStripDatum>[] = Array.from(
    {length: 8},
    (_, index) => {
      return {level: null, data: {from: timeAt(index), to: timeAt(index + 1), value: 0}};
    },
  );
  protected readonly emptyCells: readonly NdwuHeatStripCell<HeatStripDatum>[] = [];
  protected readonly loadingWithData = signal(false);
  protected readonly loadingEmpty = signal(false);
  protected readonly markerCells: readonly NdwuHeatStripCell<HeatStripDatum>[] = this.regularCells.slice(0, 8).map(
    (cell, index) => {
      return {...cell, marker: index === 2 || index === 6};
    },
  );
  protected readonly customLabel = (cell: NdwuHeatStripCell<HeatStripDatum>, index: number): string => {
    const level = cell.level === null ? 'no-data' : cell.level + 1;

    return this.translationService.instant('heat-strip-showcase.custom-cell-label', {index: index + 1, level});
  };

  protected toggleLoadingWithData(): void {
    this.loadingWithData.update((loading) => !loading);
  }

  protected toggleLoadingEmpty(): void {
    this.loadingEmpty.update((loading) => !loading);
  }
}
